<template>
  <div class="py-4">
    <div
      v-if="newObjectives.length"
      ref="chartContainer"
      class="chart-container custom-scrollbar"
      style="
      position: relative;
      width: calc(100vw - 70px);
      height: calc(100vh - 290px);
      overflow: scroll;
      margin: 0 auto;"
    >
      <!-- Objective box -->
      <v-card
        v-for="item in newObjectives"
        :id="`node-${item.id}`"
        :key="item.id"
        class="my-3 draggable hoverParentCard"
        draggable="true"
        @mouseenter="showInfo($event)"
        @mouseleave="hideInfo($event)"
        :style="{
          'position': 'absolute',
          'left': `${item.x}px`,
          'top': `${item.y}px`,
          'width': '250px',
          'height': '100px',
          'border': '1px solid black'
        }"
      >
        <v-card-title>
          <div class="d-flex text-h6">
            <h6 class="titleIcon">
              {{ item.name }}
            </h6>
          </div>
        </v-card-title>
        <v-card-text class="d-flex justify-space-between">
          <div class="d-flex trackerContainer">
            <div class="tracker">
              <h4>{{ item.tracker1 }}</h4>
            </div>
            <div class="tracker">
              <h4>{{ item.tracker2 }}</h4>
            </div>
          </div>
          <div class="pictures">
            <v-icon>mdi-bullseye-arrow</v-icon>
          </div>
        </v-card-text>
        <div id="hoverDiv" class="hoverPopup">
          <div class="hoverTitle">
            <h2 class="hoverIcon">⬷</h2>
            <h2>Key Results</h2>
          </div>
          <div class="hoverContent">
            <highcharts :options="chartOptions()" class="progressDonut"/>
            <div class="hoverData">
              <div>
                <p>No update</p>
                <div>
                  <h2>1</h2>
                  <p>4%</p>
                </div>
              </div>
              <div style="animation-delay: 0.075s;">
                <p>Off track</p>
                <div>
                  <h2>5</h2>
                  <p>20%</p>
                </div>
              </div>
              <div style="animation-delay: 0.15s;">
                <p>Prog</p>
                <div>
                  <h2>6</h2>
                  <p>23%</p>
                </div>
              </div>
              <div style="animation-delay: 0.225s;">
                <p>On track</p>
                <div>
                  <h2>14</h2>
                  <p>54%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card>

      <svg id="arrowLineInternal" :width="svgWidth" :height="svgHeight">
      <!-- Content -->
      </svg>
    </div>

    <div
      class="zoom-buttons"
      style="
      position: fixed;
      bottom: 50px;
      right: 50px;"
    >
      <v-btn @click="zoomIn"><v-icon size="24">mdi-plus</v-icon></v-btn>
      <v-btn @click="zoomOut"><v-icon size="24">mdi-minus</v-icon></v-btn>
    </div>
  </div>
</template>

<script>
// import mixinDateTime from '@/mixins/mixinDateTime';
// import dataRender from '@/mixins/dataRender';
import demoData from './demo.json';
import * as d3 from 'd3-selection';
import 'd3-transition';
import { Chart } from 'highcharts-vue'

export default
{
  name: 'ObjectiveExplore',
  // mixins: [mixinDateTime, dataRender],
  components: {
    highcharts: Chart 
  },
  data()
  {
    return {
      newObjectives: [],
      rowWidths: {},
      rowAlong: {},
      connections: [],
      nodeWidth: 270, // change to width + margin of objective elements
      halfNodeWidth: null,
      heirarchyStep: 250, // distance between rows of heirarchy
      zoomLevel: 1
    };
  },
  computed: {
    svgWidth()
    {
      const chartContainer = this.$refs.chartContainer;
      return chartContainer ? chartContainer.scrollWidth : 0;
    },
    svgHeight()
    {
      const chartContainer = this.$refs.chartContainer;
      return chartContainer ? chartContainer.scrollHeight : 0;
    },
  },
  created()
  {
    this.halfNodeWidth = this.nodeWidth / 2;
  },
  mounted()
  {
    this.readObjectives();

    this.$nextTick(() =>
    {
      this.drawConnections();
      this.dragAndDrop();
    });
  },

  methods:
  {
    chartOptions(green = 7, red = 2, grey = 1, orange = 4, middleNumber = "189")
    {
      const donutOptions = 
      {
        //removes built in features we don't want
        legend: {
          enabled: false
        },
        title: {
          text: ""
        },
        credits: {
          enabled: false
        },
        chart: {
          backgroundColor: null,
        },
        tooltip: {
          enabled: false
        },

        plotOptions: {
          series: {
            enableMouseTracking: false,
            borderWidth: 1,
            borderRadius: 2,
            colorByPoint: true,
            type: 'pie',
            size: '80px',
            innerSize: '75%',
            dataLabels: {
              enabled: false
            }
          }
        },

        series: [
          {
            type: 'pie',
            animation: false,
            data: [
              {
                y: green,
                color: "#22AD98",
                name: ""
              },
              {
                y: red,
                color: "#c3463b",
                name: ""
              },
              {
                y: orange,
                color: "#eecd21",
                name: ""
              },
              {
                y: grey,
                color: "#b8b8b8",
                name: ""
              },
            ]
          }
        ],

        subtitle: {
          text: middleNumber,
          floating: true,
          verticalAlign: 'middle',
          y: 21,
          align: "center",
          style:{
            color: "#666666",
            fontSize: "1.5em"
          },
        },
      };

      return donutOptions
    },
    showInfo(el)
    {
      el.target.querySelector("#hoverDiv").style.display = "flex";
    },
    hideInfo(el)
    {
      el.target.querySelector("#hoverDiv").style.display = "none";
    },
    zoomIn()
    {
      this.zoomLevel += 0.1;
      this.updateZoom();
    },
    zoomOut()
    {
      this.zoomLevel -= 0.1;
      this.updateZoom();
    },
    updateZoom()
    {
      const chartContainer = this.$refs.chartContainer;
      chartContainer.style.transform = `scale(${this.zoomLevel})`;
      chartContainer.classList.add('zoomed');
    },
    getRowWidths(objectives, depth)
    {
      if (!this.rowWidths[depth])
      {
        this.rowWidths[depth] = 0;
      }

      for (let i = 0; i < objectives.length; i++)
      {
        this.rowWidths[depth] += 1;

        if (objectives[i].subObjectives.length > 0)
        {
          this.getRowWidths(objectives[i].subObjectives, depth + 1);
        }
      }
    },

    getMaxWidth(data)
    {
      let maxWidth = 0;

      this.getRowWidths(data, 1);

      for (const key in this.rowWidths)
      {
        if (this.rowWidths[key] > maxWidth)
        {
          maxWidth = this.rowWidths[key];
        }
      }

      return maxWidth;
    },

    findMinMaxX(objectsArray)
    {
      let lowestX = objectsArray[0].x;
      let highestX = objectsArray[0].x;

      for (const obj of objectsArray)
      {
        if (obj.x < lowestX)
        {
          lowestX = obj.x;
        }
        if (obj.x > highestX)
        {
          highestX = obj.x;
        }
      }

      return [
        lowestX,
        highestX
      ];
    },

    clumsyTree(data, depth, rowData, maxPWidth, parentXPos, parentID)
    {
      if (!rowData[depth])
      {
        rowData[depth] = [];
      }

      if (!this.rowAlong[depth])
      {
        this.rowAlong[depth] = 0;
      }

      const depthY = (depth - 1) * this.heirarchyStep;
      const rootXIncrements = maxPWidth / (data.length + 1);

      let distanceTracker = parentXPos;
      const childSet = [];
      let nodeId;

      const evenNodesInData = data.length % 2 === 0;

      if (evenNodesInData)
      {
        distanceTracker += this.halfNodeWidth;
        distanceTracker -= (data.length / 2) * this.nodeWidth;
      }
      else
      {
        distanceTracker -= ((data.length - 1) / 2) * this.nodeWidth;
      }

      for (let i = 0; i < data.length; i++)
      {
        this.rowAlong[depth] += 1;

        nodeId = `${depth}-${this.rowAlong[depth]}`;

        let newXPos;

        if (depth === 1)
        {
          newXPos = (rootXIncrements * (i + 1)) - (this.halfNodeWidth);
        }
        else
        {
          this.connections.push(
            {
              from: parentID,
              to: nodeId
            });

          newXPos = distanceTracker;
          distanceTracker += this.nodeWidth;
        }

        childSet.push(
          {
            x: Math.floor(newXPos),
            y: depthY,
            id: nodeId,
            name: data[i].name,
            description: data[i].description
          });

        if (data[i].subObjectives.length > 0)
        {
          rowData = this.clumsyTree(data[i].subObjectives, depth + 1, rowData, maxPWidth, newXPos, nodeId);
        }
      }

      const [childSetLeft, childSetRight] = this.findMinMaxX(childSet);

      rowData[depth].push(
        {
          leftPosX: childSetLeft,
          rightPosX: childSetRight + this.nodeWidth,
          nodes: childSet,
          offset: 0,
          parentAlong: this.rowAlong[depth]
        });

      return rowData;
    },

    adjustRows(boundsLeft, boundsRight, objectsArray)
    {
      // checks if two objects overlap
      function doOverlapRightToLeft(obj1, obj2)
      {
        return obj1.rightPosX > obj2.leftPosX;
      }

      function doOverlapLeftToRight(obj1, obj2)
      {
        return obj1.leftPosX < obj2.rightPosX;
      }

      function topsAndTails(objArray,)
      {
        // Check if the first object is out of bounds on the left side
        if (objArray[0].leftPosX < boundsLeft)
        {
          const diff = boundsLeft - objArray[0].leftPosX;
          objArray[0].leftPosX += diff;
          objArray[0].rightPosX += diff;
          objArray[0].offset += diff;
        }

        // Check if the last object is out of bounds on the right side
        const lastIndex = objArray.length - 1;
        if (objArray[lastIndex].rightPosX > boundsRight)
        {
          const diff = objArray[lastIndex].rightPosX - boundsRight;
          objArray[lastIndex].rightPosX -= diff;
          objArray[lastIndex].leftPosX -= diff;
          objArray[lastIndex].offset -= diff;
        }

        return objArray;
      }

      function boundaryCheck(curObj)
      {
        // Check if the adjusted object is out of bounds on the left side
        if (curObj.leftPosX < boundsLeft)
        {
          const diff = boundsLeft - curObj.leftPosX;
          curObj.rightPosX += diff;
          curObj.leftPosX += diff;
          curObj.offset += diff;
        }

        // Check if the object is out of bounds on the right side
        if (curObj.rightPosX > boundsRight)
        {
          const diff = curObj.rightPosX - boundsRight;
          curObj.rightPosX -= diff;
          curObj.leftPosX -= diff;
          curObj.offset -= diff;
        }

        return curObj;
      }

      let offset;
      let overlapsExist = true;

      // sort based on leftPosX in ascending order
      objectsArray.sort((a, b) => a.parentAlong - b.parentAlong);

      while (overlapsExist === true)
      {
        let overlapDetected = false;

        for (let i = 0; i < objectsArray.length - 1; i++)
        {
          const currentObj = objectsArray[i];
          const nextObj = objectsArray[i + 1];

          // Check if there is an overlap with the next object
          if (doOverlapRightToLeft(currentObj, nextObj))
          {
            overlapDetected = true;

            // Calculate the required offset to avoid overlap
            offset = currentObj.rightPosX - nextObj.leftPosX;

            // Adjust the current object's position
            nextObj.leftPosX += offset;
            nextObj.rightPosX += offset;
            nextObj.offset += offset;
          }
        }

        for (let i = 0; i < objectsArray.length; i++)
        {
          objectsArray[i] = boundaryCheck(objectsArray[i]);
        }

        objectsArray = topsAndTails(objectsArray, overlapDetected);

        // sort based on leftPosX in ascending order

        for (let i = objectsArray.length - 1; i > 0; i--)
        {
          const currentObj = objectsArray[i];
          const prevObj = objectsArray[i - 1];

          // Check if there is an overlap with the next object
          if (doOverlapLeftToRight(currentObj, prevObj))
          {
            overlapDetected = true;

            // Calculate the required offset to avoid overlap
            offset = prevObj.rightPosX - currentObj.leftPosX;

            // Adjust the current object's position
            prevObj.leftPosX -= offset;
            prevObj.rightPosX -= offset;
            prevObj.offset -= offset;
          }
        }

        for (let i = 0; i < objectsArray.length; i++)
        {
          objectsArray[i] = boundaryCheck(objectsArray[i]);
        }

        objectsArray = topsAndTails(objectsArray, overlapDetected);

        if (overlapDetected === false)
        {
          overlapsExist = false;
        }
      }

      return objectsArray;
    },

    calculatePositions(mWidth, data)
    {
      const pixelWidth = this.nodeWidth * mWidth;
      let nodeRows = {};

      nodeRows = this.clumsyTree(data, 1, nodeRows, pixelWidth, 0, '');

      for (const key in nodeRows)
      {
        nodeRows[key] = this.adjustRows(0, pixelWidth, nodeRows[key]);
      }

      return nodeRows;
    },

    getPositions(data)
    {
      const maxWidth = this.getMaxWidth(data);
      const rowPositions = this.calculatePositions(maxWidth, data);
      return rowPositions;
    },

    readObjectives()
    {
      const rows = this.getPositions(JSON.parse(JSON.stringify(demoData)));

      for (const key in rows)
      {
        for (let rowIndex = 0; rowIndex < rows[key].length; rowIndex++)
        {
          const offset = rows[key][rowIndex].offset;
          const setNodes = rows[key][rowIndex].nodes;

          for (let i = 0; i < setNodes.length; i++)
          {
            const newObjective =
            {
              id: setNodes[i].id,
              name: setNodes[i].name,
              description: setNodes[i].description,
              x: setNodes[i].x + offset,
              y: setNodes[i].y,
              draggable: true
            };

            this.newObjectives.push(newObjective);
          }
        }
      }
    },

    drawConnections()
    {
      const svg = d3.select('#arrowLineInternal');
      const connections = svg.selectAll('line').data(this.connections);

      connections
        .enter()
        .append('line')
        .attr('x1', connection =>
        {
          const fromNode = document.querySelector(`#node-${connection.from}`);
          return Number(fromNode.style.left.replace('px', '')) + 125;
        })
        .attr('y1', connection =>
        {
          const fromNode = document.querySelector(`#node-${connection.from}`);
          return Number(fromNode.style.top.replace('px', '')) + 110;
        })
        .attr('x2', connection =>
        {
          const toNode = document.querySelector(`#node-${connection.to}`);
          return Number(toNode.style.left.replace('px', '')) + 125;
        })
        .attr('y2', connection =>
        {
          const toNode = document.querySelector(`#node-${connection.to}`);
          return Number(toNode.style.top.replace('px', '')) + 15;
        })
        .attr('stroke', '#6353D6')
        .attr('stroke-width', 2);
    },

    updateConnections()
    {
      const svg = d3.select('#arrowLineInternal');
      const connections = svg.selectAll('line').data(this.connections);

      connections
        .attr('x1', connection =>
        {
          const fromNode = document.querySelector(`#node-${connection.from}`);
          return Number(fromNode.style.left.replace('px', '')) + 125;
        })
        .attr('y1', connection =>
        {
          const fromNode = document.querySelector(`#node-${connection.from}`);
          return Number(fromNode.style.top.replace('px', '')) + 110;
        })
        .attr('x2', connection =>
        {
          const toNode = document.querySelector(`#node-${connection.to}`);
          return Number(toNode.style.left.replace('px', '')) + 125;
        })
        .attr('y2', connection =>
        {
          const toNode = document.querySelector(`#node-${connection.to}`);
          return Number(toNode.style.top.replace('px', '')) + 15;
        });
    },

    dragAndDrop()
    {
      let currentDrag;

      const dragStart = (event) =>
      {
        currentDrag = event.target;
        const offsetX = parseInt(event.target.style.left, 10) - event.clientX;
        const offsetY = parseInt(event.target.style.top, 10) - event.clientY;
        event.dataTransfer.setData('text/plain', `${offsetX},${offsetY}`);
      };

      const drop = (event) =>
      {
        const [offsetX, offsetY] = event.dataTransfer.getData('text/plain').split(',');

        if (currentDrag)
        {
          currentDrag.style.left = `${event.clientX + parseInt(offsetX, 10)}px`;
          currentDrag.style.top = `${event.clientY + parseInt(offsetY, 10)}px`;
          this.updateConnections();
        }

        event.preventDefault();
      };

      const dms = document.querySelectorAll('.draggable');

      dms.forEach((dm) =>
      {
        dm.addEventListener('dragstart', dragStart);
      });

      document.body.addEventListener('dragover', (event) => event.preventDefault());
      document.body.addEventListener('drop', drop);
    }

  }
};
</script>

<style>
.custom-scrollbar::-webkit-scrollbar
{
  display: none;
}

#arrowLineInternal
{
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;
  z-index: 10;
}

.hoverPopup{
  position: absolute;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px; 
  background: rgb(243, 243, 243);
  background: linear-gradient(42deg, rgba(243,243,243,1) 26%, rgba(227,227,227,1) 100%);
  padding: 5px 12px; 
  height: calc(150px - 10px); 
  width: calc(450px - 24px);
  left: 90%;
  bottom: 80%;
  z-index: 11;
  transition: 0.8s;
}

.hoverTitle{
  height: 38%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.hoverTitle > .hoverIcon{
  margin: 0 10px;
}

.indicatorWheel{
  background-color: rgba(255, 255, 255, 0); 
  border-radius: 100%; 
  aspect-ratio: 1; 
  height: calc(100% - 20px); 
  display: flex;
  align-items: center;
  justify-content: center;
  border: 9px solid;
  border-radius: 50%;
  border-color: #21AD97 #C6CDD7 #E24D39 #F6AE25;
}

.progressDonut{
  aspect-ratio: 1; 
  height: 100%; 
}

.hoverContent{
  height: 62%;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-evenly;
}

.hoverData{
  height: 100%;
  width: 75%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.hoverData > div{
  width: 24%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  max-height: 100%;
  height: 70%;
  animation: dataAppear 0.5s linear forwards;
  opacity: 0;
}

.hoverData > div > p, .hoverData > div > div > p{
  font-size: 14px;
  color: rgb(77, 77, 77);
}

.hoverData > div > div{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.hoverData > div > p, .hoverData > div > div > p, .hoverData > div > div > h2{
  margin: 0;
}

.hoverData > div > div > h2{
  margin-right: 5px;
}

@keyframes dataAppear {
  from {opacity: 0;}
  to {opacity: 1;}
}
</style>
