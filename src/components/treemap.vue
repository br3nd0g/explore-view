<template>
  <div id="treemapInspector">
    <highcharts :options="chartOptions()" id="objTreemap"/>
    <div id="objectiveInspector">
      <div class="objectiveInfoCard">
        <h1>{{ focusedObjective.name }}</h1>
        <div> 
          <h3>[CHART]</h3>
          <div>
            <h3>Project Description</h3>
            <p>{{ focusedObjective.description }}</p>
          </div>
        </div>
      </div>
      <div class="infoCard">
        <h1>
          KR Title
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
      colourList: ["#F2B090", "93CD85", "9CE1DA", "F9E099", "72B2AC", "C2D27B", "E2F2F6", "A1C7E3"],
      focusedObjective: 
      {
        // TEST DATA ONLY, will be dynamic
        "tenantId": "Columbus",
        "id": "cb2380e5-e7e2-4958-b8ae-c4f8b18094fc",
        "discriminator": "KEYRESULT",
        "parentObjectiveKeyResultId": "a249f398-98aa-43dc-8c34-76c0ecf89500",
        "objectiveKeyResults": [],
        "name": "Achieve a customer satisfaction score of at least 90% in the annual survey",
        "description": "Achieve a customer satisfaction score of at least 90% in the annual survey",
        "displayOrder": null,
        "plannedStartDate": "2023-08-01T00:00:00",
        "plannedEndDate": "2023-08-31T00:00:00",
        "actualCompletion": 0.89,
        "status": 0,
        "statusIndex": 0.00,
        "ownerUsers": [
            {
                "id": "0339e8dc-765b-4404-a4bf-7842bb4bc185",
                "tenantId": "Columbus",
                "name": "Nick Kuc",
                "firstName": "Nick",
                "lastName": "Kuc",
                "email": null,
                "projects": null,
                "portfolios": null
            }
        ],
        "discussions": [],
        "createdBy": null,
        "createdDate": null,
        "modifiedBy": null,
        "modifiedDate": null
      },
      focusedKR: null,
      focusedID: "id1", //would be null, for KR rendering purposes
    };
  },
  computed: {
    displayedKRs()
    {
      const parentId = this.focusedID

      if(this.focusedKR){ return [this.focusedKR] }
      else
      {

        let krsToShow = [];

        for(let i = 0; i < this.treemapData.length; i++){
          
          if(this.treemapData[i].parent === parentId && this.treemapData[i].discriminator === "KEYRESULT")
          {
            krsToShow.push(this.treemapData[i])
          } 
        }

        return krsToShow
      }
    },
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
        
        //flattens data in to highcharts readable data, with parent IDs
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
        //disables the title
        title: 
        {
          text: ""
        },
        //disables highcarts url credit
        credits: 
        {
          enabled: false
        },
        //enables tooltip on hover of objective
        tooltip: 
        {
          enabled: true
        },

        chart: 
        {
          backgroundColor: null,
          margin: 0,
          marginBottom: 100,
          //registering events, selection, drilldown and drillup are of interest but do not fire
          events: 
          {
            drilldown: this.testEvent,
            drillup: this.testEvent,
            click: this.testEvent,
            redraw: () => {
              // CALLED EVERYTIME GRAPH CHANGES
              // find selected objective, then get its data
              
              console.log("redraw")
            },
            selection: this.testEvent,
          },
        },

        //maximum and minimum colour a square can be dependent on data's colorValue
        colorAxis: 
        {
            minColor: '#a79dd4',
            maxColor: '#4d27f5',
            showInLegend: true,
        },

        series: 
        [
          {
            //data vis settings
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
                  //objective name styling
                  style: 
                  {
                      fontSize: '18px',
                      fontFamily: 'monospace',
                      color: 'black',
                      textOutline: null,
                      textAlign: 'center',
                      width: "95%",
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

.objectiveInfoCard{
  width: 100%;
  border: 3px solid black;
  border-radius: 15px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.objectiveInfoCard > h1{
  padding: 10px 0;
  margin-bottom: 10px;
  font-size: 15px;
  width: 400px;
}

.objectiveInfoCard > div{
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.objectiveInfoCard > div > h3, .objectiveInfoCard > div > div{
  width: calc(50% - 20px);
  padding: 10px;
}

.objectiveInfoCard > div > div{
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-direction: column;
}
</style>