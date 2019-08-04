<template>
  <div class="card h-100">
    <div class="card-header">
      <h5>{{ 'chat' | translate }}</h5>
    </div>

    <div class="card-body p-0 h-100 overflow-auto" style="flex: 1">
      <ul class="list-group overflow-auto">
        <li class="list-group-item"
          v-for="(message, index) in messages">
          <p class="force-oneline mb-2 small font-italic">{{ users[message.from].name }}:</p>
          <p class="pl-4 mb-0">{{ message.text }}</p>
        </li>
      </ul>
    </div>

    <div class="p-3 d-flex flex-column border-top">
      <div class="">
        <input type="text" id="message" class="form-control"
          :placeholder="$t('message')"
          v-model="newMessage"
          @keyup.enter="sendMessage()">
      </div>

      <div class="text-right mt-2">
        <button type="button" class="btn btn-primary"
          @click="sendMessage()">
          {{ 'send-message' | translate }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import Component from './chat';
  export default Component;
</script>
