<template>
  <div class="container admin-announcement-editor-page">
    <client-only>
      <div>
        <span class="error">{{error}}</span>
      </div>

      <div class="announcement-content">
        <span>Announcement:</span>
        <div>
          <textarea v-model="message" placeholder="enter announcement text here"></textarea>
        </div>
      </div>

      <div class="announcement-controls">
        <button v-on:click="updateMessage($event)">
          Update Announcement
        </button>
      </div>
    </client-only>
  </div>
</template>

<script>
  export default {
    name: 'admin-announcement-edit',
    middleware: 'auth',
    head: function () {
      return {
        title: 'Announcement Editor - Infinite Industries'
      }
    },
    computed: {
      currentAnnouncement: function () {
        return this.$store.getters.GetActiveAnnouncement
      }
    },
    data: function () {
      return {
        message: '',
        error: '',
        announcement: null
      }
    },
    fetch: function () {
      const idToken = this.$auth.$storage.getState('_token.auth0')

      return this.$store.dispatch('FindOrCreateActiveAnnouncement', { idToken }).then(() => {
        if (this.currentAnnouncement) {
          this.message = this.currentAnnouncement.message
          this.announcement = this.currentAnnouncement
        } else {
          this.error = 'could not establish the current active message'
        }
      })
    },
    methods: {
      updateMessage: function uupdateMessage(event) {
        event.preventDefault()

        const idToken = this.$auth.$storage.getState('_token.auth0')
        const message = this.message

        const announcement = { ...this.announcement, message }

        return this.$store.dispatch('UpdateActiveAnnouncement', { announcement, idToken })
          .then(() => {
            console.log('update complete')
          })
      }
    }
  }
</script>

<style scoped>
  .admin-announcement-editor-page {
    background: white;
    color: black;
    border-radius: 10px;
    width: 95%;
    max-width: unset;
  }
</style>
