<template>
  <div class="card">
    <h2>Chat</h2>
    <div style="margin:10px 0;">
      <textarea v-model="query" rows="3" placeholder="Ask about QA or ADO metrics..."></textarea>
    </div>
    <div class="row">
      <button class="button" @click="send" :disabled="loading">{{ loading ? 'Sending…' : 'Send' }}</button>
      <span class="kv">Backend: <code>/api/chat</code></span>
    </div>

    <div style="margin-top:16px;">
      <div v-for="m in messages" :key="m.id" class="card" style="margin-bottom:8px;">
        <div class="kv">{{ m.role }}</div>
        <div>{{ m.text }}</div>
        <div v-if="m.sources?.length" class="kv" style="margin-top:6px;">Sources: {{ m.sources }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';

const query = ref('What is our current test pass rate?');
const messages = ref([{ id: crypto.randomUUID(), role: 'assistant', text: 'Hi! Ask me about ADO metrics or QA info.' }]);
const loading = ref(false);

async function send(){
  if (!query.value.trim() || loading.value) return;
  loading.value = true;
  messages.value.push({ id: crypto.randomUUID(), role: 'user', text: query.value });
  try {
    const { data } = await axios.post('/api/chat', { query: query.value });
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', text: data.answer, sources: data.sources });
  } catch (e) {
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', text: 'Error contacting server.' });
  } finally {
    query.value = '';
    loading.value = false;
  }
}
</script>
