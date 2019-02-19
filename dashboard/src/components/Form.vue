<template>
  <div class="meta-form">
    <div class="block">
      <div class="block-content">
        <form class="form form-horizontal" onsubmit="return false">
          <div class="block">
            <div class="block-header block-header-default">
              <h3 class="block-title">
                <i :class="metadata.icon"></i>
                {{ metadata.title }}
              </h3>
            </div>
            <div class="block-content">
              <div class="row justify-content-center py-sm-3 py-md-5">
                <div class="col-sm-10 col-md-8">
                  <div class="form-group" v-for="(field, index) in metadata.fields" :key="index">
                    <label :for="field.id">{{ field.label }}</label>
                    <div v-if="field.hint" class="text-muted">
                      {{ field.hint }}
                    </div>
                    <div class="input-group" v-if="field.action">
                      <input :ref="field.id" v-if="'text' === field.type" type="text" class="form-control form-control-alt" :id="field.id" :name="field.id" :placeholder="field.placeholder" v-model="metadata.model[field.model]">
                      <div class="input-group-append field-action">
                        <button class="btn" :class="field.action.style" @click="triggerFieldAction(field)">
                          <i :class="field.action.icon"></i>
                        </button>
                      </div>
                    </div>
                    <div v-else>
                      <!-- Text inputs -->
                      <input :ref="field.id" v-if="'text' === field.type" type="text" class="form-control form-control-alt" :id="field.id" :name="field.id" :placeholder="field.placeholder" v-model="metadata.model[field.model]">
                      <input :ref="field.id" v-if="'password' === field.type" type="password" class="form-control form-control-alt" :id="field.id" :name="field.id" :placeholder="field.placeholder" v-model="metadata.model[field.model]">

                      <!-- Select -->
                      <select :ref="field.id" v-if="'select' === field.type" class="form-control form-control-alt" id="new-vv-type" name="new-vv-type" :placeholder="field.placeholder" v-model="metadata.model[field.model]">
                        <option v-for="(option, index) in field.options" :key="index" :value="option.value">{{ option.label }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="block-footer">
              <div class="text-center">
                <button v-for="(action, index) in metadata.actions" :key="index" class="btn" :class="action.style" @click="triggerEntityAction(action)">
                  <i :class="action.icon"></i>
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
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
}

</style>
