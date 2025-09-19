<template>
  <div>
    <h1>Work Items Dashboard</h1>
    <form @submit.prevent="onSubmit" class="workitems-form">
      <div class="form-group">
        <label for="iterationPath">Iteration Path:</label>
        <input 
          id="iterationPath" 
          v-model="filters.iterationPath" 
          placeholder="e.g. Cloud Platform\2025\Q3-2025\Sep Sprint 2" 
          required 
        />
      </div>
      <div class="form-group">
        <label for="qaName">QA Name:</label>
        <input 
          id="qaName" 
          v-model="filters.qaName" 
          placeholder="e.g. Shrikant Damahe" 
          required 
        />
      </div>
      <button type="submit">Fetch Work Items</button>
    </form>

    <div v-if="loading" class="loading">
      Loading...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else>
      <!-- Work Items Table -->
      <div class="table-container" v-if="workItems.length">
        <h2>Work Items ({{ workItems.length }})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Completed Work</th>
              <th>Remaining Work</th>
              <th>Total Work</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in workItems" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.title }}</td>
              <td>{{ item.completedWork }}</td>
              <td>{{ item.remainingWork }}</td>
              <td>{{ item.completedWork + item.remainingWork }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Work Distribution Chart -->
      <div v-if="workItems.length" class="chart-container">
        <h2>Work Distribution</h2>
        <div id="workDistributionChart"></div>
      </div>

      <!-- Progress Chart -->
      <div v-if="workItems.length" class="chart-container">
        <h2>Work Progress Overview</h2>
        <div id="progressChart"></div>
      </div>

      <div v-if="!workItems.length && !loading" class="no-data">
        No work items found for the specified criteria
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Plotly from 'plotly.js-dist-min';

const workItems = ref([]);
const loading = ref(false);
const error = ref(null);
const filters = ref({
  iterationPath: '',
  qaName: ''
});

async function fetchWorkItems() {
  loading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams({
      iterationPath: filters.value.iterationPath,
      qaName: filters.value.qaName
    });
    const response = await fetch(`http://localhost:5050/api/tasks?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    workItems.value = await response.json();
    drawCharts();
  } catch (e) {
    error.value = `Failed to fetch work items: ${e.message}`;
    workItems.value = [];
  } finally {
    loading.value = false;
  }
}

function drawCharts() {
  if (!workItems.value.length) return;

  // Work Distribution Chart
  const totalCompleted = workItems.value.reduce((sum, item) => sum + (item.completedWork || 0), 0);
  const totalRemaining = workItems.value.reduce((sum, item) => sum + (item.remainingWork || 0), 0);

  Plotly.newPlot('workDistributionChart', [{
    values: [totalCompleted, totalRemaining],
    labels: ['Completed Work', 'Remaining Work'],
    type: 'pie',
    marker: {
      colors: ['#4CAF50', '#FFA726']
    }
  }], {
    title: 'Work Distribution',
    height: 400
  });

  // Progress Chart (Bar chart for individual items)
  const trace1 = {
    x: workItems.value.map(item => item.id.toString()),
    y: workItems.value.map(item => item.completedWork || 0),
    name: 'Completed',
    type: 'bar',
    marker: { color: '#4CAF50' }
  };

  const trace2 = {
    x: workItems.value.map(item => item.id.toString()),
    y: workItems.value.map(item => item.remainingWork || 0),
    name: 'Remaining',
    type: 'bar',
    marker: { color: '#FFA726' }
  };

  Plotly.newPlot('progressChart', [trace1, trace2], {
    barmode: 'stack',
    title: 'Work Items Progress',
    xaxis: { title: 'Work Item ID' },
    yaxis: { title: 'Hours' },
    height: 400
  });
}

function onSubmit() {
  fetchWorkItems();
}

// Clean up charts when component is unmounted
onMounted(() => {
  return () => {
    Plotly.purge('workDistributionChart');
    Plotly.purge('progressChart');
  };
});
</script>

<style scoped>
.workitems-form {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
}

button {
  padding: 8px 20px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  height: 40px;
}

button:hover {
  background: #1565c0;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 1rem 0;
}

.error {
  color: #d32f2f;
  background: #ffebee;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f5f5f5;
  font-weight: 500;
}

.chart-container {
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

h1, h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.25rem;
}
</style>