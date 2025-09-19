<template>
  <div>
    <h1>QA Work Item Metrics</h1>
    <form @submit.prevent="onSubmit" class="metrics-form">
      <div class="form-group">
        <label for="iterationPath">Iteration Path:</label>
        <input id="iterationPath" v-model="iterationPath" placeholder="e.g. Project\\Release\\Sprint 1" required />
      </div>
      <div class="form-group">
        <label for="qaName">QA Name:</label>
        <input id="qaName" v-model="qaName" placeholder="e.g. Shrikant Damahe" required />
      </div>
      <div class="form-group">
        <label for="workItemType">Work Item Type:</label>
        <select id="workItemType" v-model="selectedWorkItemType">
          <option value="all">All (Task, PBI, Bug)</option>
          <option value="task">Task</option>
          <option value="pbi">PBI</option>
          <option value="bug" selected>Bug</option>
        </select>
      </div>
      <button type="submit">Fetch</button>
    </form>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <!-- Tasks Section -->
      <div v-if="selectedWorkItemType === 'all' || selectedWorkItemType === 'task'">
        <h2>Tasks</h2>
        <table border="1" cellpadding="6" style="margin-bottom: 2rem;" v-if="tasks.length">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>State</th>
              <th>Assign QA</th>
              <th>Completed Work</th>
              <th>Remaining Work</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.title }}</td>
              <td>{{ task.state }}</td>
              <td>{{ task.assignQA }}</td>
              <td>{{ task.completedWork }}</td>
              <td>{{ task.remainingWork }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="selectedWorkItemType === 'task' || selectedWorkItemType === 'all'">
          <p>No tasks found for the selected criteria.</p>
        </div>
      </div>
      
      <!-- PBIs Section -->
      <div v-if="selectedWorkItemType === 'all' || selectedWorkItemType === 'pbi'">
        <h2>Product Backlog Items (PBIs)</h2>
        <table border="1" cellpadding="6" style="margin-bottom: 2rem;" v-if="pbis.length">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>State</th>
              <th>Priority</th>
              <th>Assign QA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pbi in pbis" :key="pbi.id">
              <td>{{ pbi.id }}</td>
              <td>{{ pbi.title }}</td>
              <td>{{ pbi.state }}</td>
              <td>{{ pbi.priority }}</td>
              <td>{{ pbi.assignQA }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="selectedWorkItemType === 'pbi' || selectedWorkItemType === 'all'">
          <p>No PBIs found for the selected criteria.</p>
        </div>
      </div>

      <!-- Bugs Section -->
      <div v-if="selectedWorkItemType === 'all' || selectedWorkItemType === 'bug'">
        <h2>Bugs</h2>
        <table border="1" cellpadding="6" style="margin-bottom: 2rem;" v-if="bugs.length">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Severity</th>
              <th>Priority</th>
              <th>Assign QA</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bug in bugs" :key="bug.id">
              <td>{{ bug.id }}</td>
              <td>{{ bug.title }}</td>
              <td>{{ bug.severity }}</td>
              <td>{{ bug.priority }}</td>
              <td>{{ bug.assignQA }}</td>
              <td>{{ bug.state }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="selectedWorkItemType === 'bug' || selectedWorkItemType === 'all'">
          <p>No bugs found for the selected criteria.</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div v-if="selectedWorkItemType === 'all' || selectedWorkItemType === 'task'">
        <h3>Task Analytics</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 2rem; margin-bottom: 2rem;">
          <div id="taskStateChart" style="width:100%;max-width:500px;height:400px;"></div>
          <div id="taskWorkChart" style="width:100%;max-width:500px;height:400px;"></div>
        </div>
      </div>
      <div v-if="selectedWorkItemType === 'all' || selectedWorkItemType === 'pbi'">
        <h3>PBI Analytics</h3>
        <div id="pbiStateChart" style="width:100%;max-width:700px;height:400px;margin-bottom:2rem;"></div>
      </div>
      <div v-if="selectedWorkItemType === 'all' || selectedWorkItemType === 'bug'">
        <h3>Bug Analytics</h3>
        <div id="bugStateChart" style="width:100%;max-width:700px;height:400px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';

const tasks = ref([]);
const pbis = ref([]);
const bugs = ref([]);
const loading = ref(false);
const iterationPath = ref('');
const qaName = ref('');
const selectedWorkItemType = ref('bug'); // Default to bug

async function fetchTasks() {
  if (!iterationPath.value || !qaName.value) return [];
  try {
    const params = new URLSearchParams({ iterationPath: iterationPath.value, qaName: qaName.value });
    const res = await fetch(`http://localhost:5050/api/api/tasks?${params}`);
    return await res.json();
  } catch (e) {
    console.error('Error fetching tasks:', e);
    return [];
  }
}

async function fetchPbis() {
  if (!iterationPath.value || !qaName.value) return [];
  try {
    const params = new URLSearchParams({ iterationPath: iterationPath.value, qaName: qaName.value });
    const res = await fetch(`http://localhost:5050/api/api/pbi?${params}`);
    return await res.json();
  } catch (e) {
    console.error('Error fetching PBIs:', e);
    return [];
  }
}

async function fetchBugs() {
  if (!iterationPath.value || !qaName.value) return [];
  try {
    const params = new URLSearchParams({ iterationPath: iterationPath.value, qaName: qaName.value });
    const res = await fetch(`http://localhost:5050/api/bugs?${params}`);
    return await res.json();
  } catch (e) {
    console.error('Error fetching bugs:', e);
    return [];
  }
}

async function fetchSelectedData() {
  if (!iterationPath.value || !qaName.value) return;
  loading.value = true;
  
  try {
    // Reset all data first
    tasks.value = [];
    pbis.value = [];
    bugs.value = [];

    if (selectedWorkItemType.value === 'all') {
      const [tasksData, pbisData, bugsData] = await Promise.all([
        fetchTasks(),
        fetchPbis(),
        fetchBugs()
      ]);
      tasks.value = tasksData;
      pbis.value = pbisData;
      bugs.value = bugsData;
    } else if (selectedWorkItemType.value === 'task') {
      tasks.value = await fetchTasks();
    } else if (selectedWorkItemType.value === 'pbi') {
      pbis.value = await fetchPbis();
    } else if (selectedWorkItemType.value === 'bug') {
      bugs.value = await fetchBugs();
    }
  } catch (e) {
    console.error('Error fetching data:', e);
    tasks.value = [];
    pbis.value = [];
    bugs.value = [];
  }
  loading.value = false;
}

function drawTasksChart() {
  if (!tasks.value.length) return;
  const states = [...new Set(tasks.value.map(t => t.state))];
  const counts = states.map(state => tasks.value.filter(t => t.state === state).length);

  const data = [{
    values: counts,
    labels: states,
    type: 'pie',
    hole: 0.4,
    marker: {
      colors: ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#607D8B']
    }
  }];
  const layout = {
    title: 'Tasks by State',
    showlegend: true,
    font: { size: 14 }
  };
  Plotly.newPlot('taskStateChart', data, layout, {responsive: true});
}

function drawTaskWorkChart() {
  if (!tasks.value.length) return;
  const qaNames = [...new Set(tasks.value.map(t => t.assignQA))].filter(qa => qa);
  const completed = qaNames.map(qa => 
    tasks.value.filter(t => t.assignQA === qa).reduce((sum, t) => sum + (t.completedWork || 0), 0)
  );
  const remaining = qaNames.map(qa => 
    tasks.value.filter(t => t.assignQA === qa).reduce((sum, t) => sum + (t.remainingWork || 0), 0)
  );

  const data = [
    {
      x: qaNames,
      y: completed,
      name: 'Completed Work',
      type: 'bar',
      marker: { color: '#4CAF50' }
    },
    {
      x: qaNames,
      y: remaining,
      name: 'Remaining Work',
      type: 'bar',
      marker: { color: '#FF9800' }
    }
  ];
  const layout = {
    barmode: 'group',
    title: 'Completed vs Remaining Work by QA',
    xaxis: { title: 'QA' },
    yaxis: { title: 'Work (hours)' },
    font: { size: 12 }
  };
  Plotly.newPlot('taskWorkChart', data, layout, {responsive: true});
}

function drawPbiChart() {
  if (!pbis.value.length) return;
  const states = [...new Set(pbis.value.map(p => p.state))];
  const counts = states.map(state => pbis.value.filter(p => p.state === state).length);

  const data = [{
    values: counts,
    labels: states,
    type: 'pie',
    hole: 0.4,
    marker: {
      colors: ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#607D8B']
    }
  }];
  const layout = {
    title: 'PBIs by State',
    showlegend: true,
    font: { size: 14 }
  };
  Plotly.newPlot('pbiStateChart', data, layout, {responsive: true});
}

function drawBugChart() {
  if (!bugs.value.length) return;
  const states = [...new Set(bugs.value.map(b => b.state))];
  const counts = states.map(state => bugs.value.filter(b => b.state === state).length);

  const data = [{
    values: counts,
    labels: states,
    type: 'pie',
    hole: 0.4,
    marker: {
      colors: ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#607D8B']
    }
  }];
  const layout = {
    title: 'Bugs by State',
    showlegend: true,
    font: { size: 14 }
  };
  Plotly.newPlot('bugStateChart', data, layout, {responsive: true});
}

function drawAllCharts() {
  drawTasksChart();
  drawTaskWorkChart();
  drawPbiChart();
  drawBugChart();
}

function onSubmit() {
  fetchSelectedData().then(drawAllCharts);
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
th, td {
  padding: 8px 12px;
  text-align: left;
}
.metrics-form {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.metrics-form label {
  font-weight: 500;
  margin-bottom: 0.3rem;
}
.metrics-form input,
.metrics-form select {
  padding: 6px 10px;
  border: 1px solid #bbb;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 220px;
}
.metrics-form button {
  padding: 8px 18px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.metrics-form button:hover {
  background: #125ea2;
}
h3 {
  color: #333;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}
@media (max-width: 768px) {
  .metrics-form {
    flex-direction: column;
    align-items: stretch;
  }
  .form-group {
    margin-bottom: 1rem;
  }
}
</style>
