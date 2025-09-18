<template>
  <div>
    <h1>QA Task Metrics</h1>
    <form @submit.prevent="onSubmit" class="metrics-form">
      <div class="form-group">
        <label for="iterationPath">Iteration Path:</label>
        <input id="iterationPath" v-model="iterationPath" placeholder="e.g. Project\\Release\\Sprint 1" required />
      </div>
      <div class="form-group">
        <label for="qaName">QA Name:</label>
        <input id="qaName" v-model="qaName" placeholder="e.g. John Doe" required />
      </div>
      <button type="submit">Fetch</button>
    </form>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <table border="1" cellpadding="6" style="margin-bottom: 2rem;">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Assign QA</th>
            <th>Completed Work</th>
            <th>Remaining Work</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.id">
            <td>{{ task.id }}</td>
            <td>{{ task.title }}</td>
            <td>{{ task.assignQA }}</td>
            <td>{{ task.completedWork }}</td>
            <td>{{ task.remainingWork }}</td>
          </tr>
        </tbody>
      </table>
      <div id="workChart" style="width:100%;max-width:700px;height:400px;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';

const tasks = ref([]);
const loading = ref(false);
const iterationPath = ref('');
const qaName = ref('');

async function fetchTasks() {
  if (!iterationPath.value || !qaName.value) return;
  loading.value = true;
  try {
    const params = new URLSearchParams({ iterationPath: iterationPath.value, qaName: qaName.value });
    const res = await fetch(`http://localhost:5050/api/api/tasks?${params}`);
    tasks.value = await res.json();
  } catch (e) {
    tasks.value = [];
  }
  loading.value = false;
}

function drawChart() {
  if (!tasks.value.length) return;
  const qaNames = [...new Set(tasks.value.map(t => t.assignQA))];
  const completed = qaNames.map(qa => tasks.value.filter(t => t.assignQA === qa).reduce((sum, t) => sum + (t.completedWork || 0), 0));
  const remaining = qaNames.map(qa => tasks.value.filter(t => t.assignQA === qa).reduce((sum, t) => sum + (t.remainingWork || 0), 0));

  const data = [
    {
      x: qaNames,
      y: completed,
      name: 'Completed Work',
      type: 'bar',
      marker: { color: 'green' }
    },
    {
      x: qaNames,
      y: remaining,
      name: 'Remaining Work',
      type: 'bar',
      marker: { color: 'orange' }
    }
  ];
  const layout = {
    barmode: 'group',
    title: 'Completed vs Remaining Work by QA',
    xaxis: { title: 'QA' },
    yaxis: { title: 'Work (hours)' }
  };
  Plotly.newPlot('workChart', data, layout, {responsive: true});
}

function onSubmit() {
  fetchTasks().then(drawChart);
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
.metrics-form input {
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
</style>
