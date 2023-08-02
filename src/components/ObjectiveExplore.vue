<template>
  <div class="py-4">
    <div v-if="newObjectives.length" 
      style="position: relative;"
      @dragover="dragOver($event)"
      @drop="drop($event)"
      id="objectivesContainer"
    >
      <!-- Objective box -->
      <v-card
        v-for="item in newObjectives" :id="item.id" :key="item.id"
        class="my-3"
        :style="{
          'position': 'absolute',
          'left': `${item.x}px`,
          'top': `${item.y}px`,
          'width': '250px',
          'height': '100px',
          'border': '2px solid black'
        }"
        draggable="true"
        @dragstart="dragStart($event)"
      >
        <v-card-title>
          <div class="d-flex text-h6">
            <h6 class="titleIcon">
              <v-icon>mdi-bullseye-arrow</v-icon>
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
      </v-card>
    </div>
  </div>
</template>

<script>
//import mixinDateTime from '@/mixins/mixinDateTime';
//import dataRender from '@/mixins/dataRender';
import demoData from './demo.json';
import * as arrowLine from 'arrow-line';
// npm install arrow-line

export default
{
  name: 'ObjectiveExplore',
  //mixins: [mixinDateTime, dataRender],
  data()
  {
    return {
      newObjectives: [],
      // nodes: [],
      rowWidths: {},
      rowAlong: {},
      connections: [],
      nodeWidth: 300, //change to width + margin of objective elements
      halfNodeWidth: null,
      heirarchyStep: 275, //distance between rows of heirarchy
      currentDrag: null,
    };
  },
  created()
  {
    this.halfNodeWidth = this.nodeWidth / 2;
  },
  mounted()
  {
    this.readObjectives();
    setTimeout(this.setup, 50)
  },

  methods:
  {
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

        nodeId = `node${depth}-${this.rowAlong[depth]}`;

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

        //----------------------------------------------------------------------//
        // If any data attributes needs to be read, add them to this dictionary //
        //----------------------------------------------------------------------//
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
      function doOverlapRightToLeft(obj1, obj2)
      {
        return obj1.rightPosX > obj2.leftPosX;
      }
      function doOverlapLeftToRight(obj1, obj2)
      {
        return obj1.leftPosX < obj2.rightPosX;
      }
      function topsAndTails(objArray)
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
            //--------------------------------------------------------------------------------//
            // Any data added to an objective in clumsyTree() needs to be read and added here //
            //--------------------------------------------------------------------------------//
            const newObjective =
            {
              id: setNodes[i].id,
              name: setNodes[i].name,
              description: setNodes[i].description,
              x: setNodes[i].x + offset,
              y: setNodes[i].y,
            };

            this.newObjectives.push(newObjective);
          }
        }
      }
    },
    makeConnections()
    {
      for (let i = 0; i < this.connections.length; i++)
      {

        const newArrow = arrowLine(
          {
            source: '#' + this.connections[i].from,
            destination: '#' + this.connections[i].to,
            color: '#6353D6',
            thickness: 8,
            endpoint:
            {
              size: 0.5
            },
            destinationPosition: 'topCenter',
            forceDirection: 'vertical',
            sourcePosition: 'bottomCenter'
          });

        this.connections[i].arrow = newArrow;
      }
    },
    updateArrows()
    {
      for (let i = 0; i < this.connections.length; i++)
      {
        this.connections[i].arrow.update(
          {
            source: '#' + this.connections[i].from,
            destination: '#' + this.connections[i].to
          }
        );
      }
    },
    setup()
    {
      this.makeConnections();
      setInterval(this.updateArrows, 10);
    },
    dragStart(event)
    {
      this.currentDrag = event.target
      var style = window.getComputedStyle(event.target, null);
      event.dataTransfer.setData("text/plain",
      (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
    },
    dragOver(event)
    { 
      event.preventDefault(); 
    },
    drop(event)
    {
      var offset = event.dataTransfer.getData("text/plain").split(',');
      this.currentDrag.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
      this.currentDrag.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
      event.preventDefault();
    },
  }
};
</script>

<style>
  body
  {
    min-width: 200vw;
    min-height: 200vh;
  }
  #objectivesContainer{
    min-width: 200vw;
    min-height: 200vh;
  }
</style>