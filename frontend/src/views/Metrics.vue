<template>
  <div class="card">
    <h2>Metrics</h2>

    <div class="row" style="margin:10px 0;">
      <input class="input" v-model="project" placeholder="Project (default from server)" />
      <input class="input" v-model="person" placeholder="Person (QA display name)" />
      <input class="input" v-model="targeted_release" placeholder="Targeted Release (e.g., 2025.10)" />
      <button class="button" @click="refresh">Refresh</button>
    </div>

    <div class="grid" style="margin-top:10px;">
      <div class="card">
        <div class="kv">Open Bugs by Severity</div>
        <div v-if="bugsBySeverity">
          <div v-for="(v,k) in bugsBySeverity.counts" :key="k">{{ k }}: <b>{{ v }}</b></div>
        </div>
      </div>
      <div class="card">
        <div class="kv">Backlog by QA (type / severity / priority / release)</div>
        <div v-if="backlog">
          <div>Items: <b>{{ backlog.count }}</b></div>
          <div class="kv" style="margin-top:6px;">By Type</div>
          <div v-for="(v,k) in backlog.byType" :key="k">{{ k }}: <b>{{ v }}</b></div>
          <div class="kv" style="margin-top:6px;">By Severity</div>
          <div v-for="(v,k) in backlog.bySeverity" :key="k">{{ k }}: <b>{{ v }}</b></div>
        </div>
      </div>
      <div class="card">
        <div class="kv">Recent Test Pass Rate</div>
        <div v-if="testRate">
          <div>Pass rate: <b>{{ testRate.pass_rate?.toFixed?.(1) ?? 'N/A' }}%</b></div>
          <div class="kv" style="margin-top:6px;">Recent Runs</div>
          <div v-for="r in testRate.runs" :key="r.id">{{ r.name }} — Passed {{ r.passed }}/{{ r.total }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';

const project = ref('');
const person = ref('');
const targeted_release = ref('');

const bugsBySeverity = ref(null);
const backlog = ref(null);
const testRate = ref(null);

async function refresh(){
  const params = {};
  if (project.value) params.project = project.value;
  if (person.value) params.person = person.value;
  if (targeted_release.value) params.targeted_release = targeted_release.value;

  const [a,b,c] = await Promise.all([
    axios.get('/api/metrics/bugs_by_severity', { params }),
    axios.get('/api/metrics/backlog_by_qa', { params }),
    axios.get('/api/metrics/test_pass_rate', { params }),
  ]);
  bugsBySeverity.value = a.data;
  backlog.value = b.data;
  testRate.value = c.data;
}

refresh();
</script>
