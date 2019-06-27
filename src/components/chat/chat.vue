<template>
  <div class="nes-container with-title">
    <p class="title">
      {{ 'chat' | translate }}
    </p>

    <p v-for="(message, index) in messages">
      {{ users[message.from].name }}: {{ message.text }}
    </p>

    <div class="mt-4">
      <div class="nes-field">
        <label for="message">{{ 'message' | translate }}</label>
        <input type="text" id="message" class="nes-input"
          v-model="newMessage"
          @keyup.enter="sendMessage()">
      </div>
    </div>

    <div class="text-right mt-4">
      <button type="button" class="nes-btn is-primary"
        @click="sendMessage()">
        {{ 'send-message' | translate }}
      </button>
    </div>
  </div>
</template>

<script>
  import Component from './chat';
  export default Component;
</script>
