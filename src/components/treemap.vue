<template>
  <div id="treemapInspector">
    <highcharts :options="chartOptions()" id="objTreemap"/>
    <div id="objectiveInspector">
      <div class="infoCard">
        <h1>Current Focused Objective [empty if at root]</h1>
      </div>
      <div class="infoCard">
        <h1>
          KRs of current object listed, if kr is selected others disappear and selected floats to top pos (here)
        </h1>
      </div>
    </div>
  </div>

</template>

<script>
// import mixinDateTime from '@/mixins/mixinDateTime';
// import dataRender from '@/mixins/dataRender';
import { Chart } from 'highcharts-vue'
import data from './data.json';
// eslint-disable-next-line
import keyresults from './keyresults.json';

export default
{
  name: 'TreeMap',
  // mixins: [mixinDateTime, dataRender],
  components: {
    highcharts: Chart 
  },
  data()
  {
    return {
      treemapData: [],
      colourList: ["#F2B090", "93CD85", "9CE1DA", "F9E099", "72B2AC", "C2D27B", "E2F2F6", "A1C7E3"]
    };
  },
  computed: {

  },
  created()
  {
    this.createTreemapData(data, null)
    console.log(this.treemapData)
  },
  mounted()
  {
      
  },

  methods:
  {
    createTreemapData(objectivesList, parentID, colour=null)
    {

      let childCounter = 1;
      let curDataId;
      let colourIndex = 0;

      objectivesList.forEach(objective => {
        

        if(parentID !== null){ curDataId = `id${parentID}-${childCounter}` }
        else
        { 
          curDataId = `id${childCounter}` 
          colour = this.colourList[colourIndex];
          colourIndex++;
        }

        let dataPoint = {
          name: objective.name,
          id: curDataId,
          parent: parentID,
          value: 1 + objective.ownerUsers.length,
          colorValue: 1 + objective.ownerUsers.length,
          discriminator: objective.discriminator
        }

        if(parentID === null){ 
          //dataPoint.colorValue = Math.random()*8 
          dataPoint.value = 1 + objective.objectiveKeyResults.length
        }

        this.treemapData.push(dataPoint);

        if (objective.objectiveKeyResults.length > 0){
          this.createTreemapData(objective.objectiveKeyResults, curDataId, colour)
        }

        childCounter += 1;
      });
    },
    chartOptions()
    {
      const mapOptions = 
      {
        accessibility:
        {
          enabled: false
        },
        title: 
        {
          text: ""
        },
        credits: 
        {
          enabled: false
        },
        tooltip: 
        {
          enabled: true
        },

        chart: 
        {
          backgroundColor: null,
          margin: 0,
          marginBottom: 100,
          events: 
          {
            drilldown: this.testEvent,
            click: this.testEvent
          },
        },

        colorAxis: 
        {
            minColor: '#a79dd4',
            maxColor: '#4d27f5',
            showInLegend: true,
        },

        series: 
        [
          {
            name: "Objectives",
            type: 'treemap',
            allowTraversingTree: true,

            layoutAlgorithm: 'squarified',
            borderWidth: 1,
            borderColor: "#262626",
            animationLimit: 50,

            data: this.treemapData,

            dataLabels: 
            {
              enabled: false
            },

            levels: 
            [
              {
                level: 1,
                borderWidth: 3,
                borderColor: "#262626",
                layoutAlgorithm: "stripes",
                dataLabels: 
                {
                  enabled: true,
                  style: 
                  {
                      fontSize: '14px'
                  }
                },
                levelIsConstant: false
              },
            ],
          }
        ],
      }

      return mapOptions
    },
    testEvent(event)
    {
      console.log("registered", event)
    },
  }
};
</script>

<style>

#treemapInspector{
  width: 100%;
  height: 800px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}

#objectiveInspector, #objTreemap{
  width: 50%;
  height: 100%;
}

#objectiveInspector{
  width: 40%;
}

#objectiveInspector{
  max-width: 525px;
}

.infoCard{
  width: 100%;
  height: 150px;
  border: 3px solid black;
  border-radius: 15px;
  margin-bottom: 40px;
}
</style>