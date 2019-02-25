<template>
  <form class="form meta-form form-horizontal" onsubmit="return false">
    <div class="form-header form-header-default">
      <h3 class="form-title">
        <i :class="metadata.icon"></i>
        {{ metadata.title }}
      </h3>
    </div>
    <div class="form-fields">
      <div class="form-group form-field" v-for="(field, index) in metadata.fields" :key="index">
        <label :for="field.id">{{ field.label }}</label>
        <div class="input-group" v-if="field.action">
          <input :ref="field.id" v-if="'text' === field.type" type="text" class="form-control form-control-alt" :id="field.id" :name="field.id" :placeholder="field.placeholder" v-model="metadata.model[field.id]">
          <div class="input-group-append field-action">
            <button class="btn" :class="field.action.style" @click="triggerFieldAction(field)">
              <i :class="field.action.icon"></i>
            </button>
          </div>
        </div>
        <div v-else>
          <!-- Text inputs -->
          <input :ref="field.id" v-if="'text' === field.type" type="text" class="form-control form-control-alt" :id="field.id" :name="field.id" :placeholder="field.placeholder" v-model="metadata.model[field.id]">
          <input :ref="field.id" v-else-if="'password' === field.type" type="password" class="form-control form-control-alt" :id="field.id" :name="field.id" :placeholder="field.placeholder" v-model="metadata.model[field.id]">
          <textarea :ref="field.id" v-else-if="'textarea' === field.type" class="form-control form-control-alt" :rows="field.rows" :class="field.style" :id="field.id" :name="field.id" :placeholder="field.placeholder" v-model="metadata.model[field.id]"></textarea>

          <!-- Select -->
          <select :ref="field.id" v-if="'select' === field.type" class="form-control form-control-alt" id="new-vv-type" name="new-vv-type" :placeholder="field.placeholder" v-model="metadata.model[field.id]">
            <option v-if="field.placeholder" value="">{{ field.placeholder }}</option>
            <option v-for="(option, index) in field.options" :key="index" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
        <div v-if="field.hint" class="field-hint" v-html="field.hint"></div>
      </div>
    </div>
    <div class="form-footer">
      <div class="text-center">
        <button v-for="(action, index) in metadata.actions" :key="index" class="btn" :class="action.style" @click="triggerEntityAction(action)">
          <i :class="action.icon"></i>
          {{ action.label }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'metaForm',
  props: ['metadata'],
  data () {
    return {
    }
  },
  methods: {
    triggerEntityAction (action) {
      const handler = action.handler;
      const model = this.metadata.model
      handler(model);
    },
    triggerFieldAction (field) {
      const handler = field.action.handler
      const model = this.metadata.model;
      const value = handler(model);
      if (value !== undefined) {
        model[field.model] = value;
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.meta-form {
  width: 100%;

  .form-title {
    font-size: 1.2em;
    text-align: left;
  }

  .form-fields {
    .form-field {
      text-align: left;
      
      label {
        font-weight: bold;
        text-indent: 3px;
      }

      .field-hint {
        text-align: left;
        padding-left: 0.5em;
        font-size: .9em;
      }
    }

    textarea {
      margin: .5em 0;
      padding: .5em;
      width: 100%;
      border: none;
      background: rgba(0, 0, 0, .6);
      border-radius: .5em;
      color: white !important;

      &::placeholder {
        color: #999;
      }
    }
  }
}

</style>
