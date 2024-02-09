<template>
  <div>
    <div
      ref="modalEl"
      tabindex="-1"
      class="modal"
      data-bs-backdrop="static"
      :class="`${containerClass} modal-${size} ${isAnimated ? 'fade' : ''}`"
      :aria-hidden="!isShown"
    >
      <div :class="`modal-dialog ${isCentered ? 'modal-dialog-centered' : ''}`">
        <div class="modal-content">
          <template v-if="!hideHeader && title">
            <div class="modal-header pb-0" :class="headerClass">
              <slot
                name="header"
                v-bind="{ hide, okTitle, cancelTitle }"
                :handle-cancel="handleCancel"
                :handle-ok="handleOk"
              >
                <h5 class="modal-title">
                  {{ title }}
                </h5>
                <template v-if="!hideClose">
                  <button
                    type="button"
                    class="btn-close"
                    aria-label="close"
                    role="button"
                    @click="handleCancel"
                  ></button>
                </template>
              </slot>
            </div>
          </template>
          <div class="modal-body" :class="bodyClass">
            <slot
              v-bind="{
                hide,
                okTitle,
                okClass,
                cancelTitle,
                cancelClass
              }"
              :handle-cancel="handleCancel"
              :handle-ok="handleOk"
            />
          </div>
          <template v-if="!hideFooter">
            <div class="modal-footer" :class="footerClass">
              <slot
                name="footer"
                v-bind="{ hide, okTitle, cancelTitle }"
                :handle-cancel="handleCancel"
                :handle-ok="handleOk"
              >
                <template v-if="!hideCancel">
                  <slot
                    name="modal-cancel"
                    v-bind="{
                      hide,
                      cancelTitle,
                      cancelClass
                    }"
                  >
                    <ButtonComp
                      :variant="cancelVariant"
                      :disabled="cancelDisabled"
                      @click="handleCancel"
                    >
                      {{ cancelTitle }}
                    </ButtonComp>
                  </slot>
                </template>
                <slot
                  name="modal-ok"
                  v-bind="{
                    hide,
                    okTitle,
                    okClass
                  }"
                >
                  <ButtonComp
                    :variant="okVariant"
                    :disabled="okDisabled"
                    @click="handleOk"
                  >
                    {{ okTitle }}
                  </ButtonComp>
                </slot>
              </slot>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/*

// Show/hide using trigger slot
<Modal ref="myModalComponent" />

// Show/hide modal using ref:
<Modal ref="myModalComponent" />
const myModalComponent = ref<Modal>()
myModalComponent.value?.show() | myModalComponent.value?.hide()

// Show/hide modal using v-modal:
<Modal v-model="doShowModal" />

*/

import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Modal } from 'bootstrap'
import ButtonComp from './ButtonComp.vue';

interface IProps {
  isCentered?: boolean
  isAnimated?: boolean
  modelValue?: boolean
  title?: string | undefined
  size?: 'lg' | 'md' | 'sm'
  hideHeader?: boolean
  hideFooter?: boolean
  hideCancel?: boolean
  hideClose?: boolean
  cancelTitle?: string
  cancelDisabled?: boolean
  cancelVariant?: string
  okTitle?: string
  okVariant?: string
  okDisabled?: boolean
  headerClass?: string
  bodyClass?: string
  containerClass?: string
  footerClass?: string
  hideOnKeyboard?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  title: undefined,
  size: 'md',
  position: '',
  cancelTitle: 'Cancel',
  cancelVariant: 'light',
  okTitle: 'Ok',
  okVariant: 'primary',
  headerClass: undefined,
  bodyClass: '',
  containerClass: '',
  footerClass: undefined,
  isAnimated: true,
  isCentered: false,
  hideOnKeyboard: true
})

const emit = defineEmits(['update:modelValue', 'cancel', 'ok'])

defineExpose({ show, hide })

let modalEl = ref<HTMLDivElement>()
let bsModal = ref<Modal>()
const isShown = ref(false)
onMounted(() => {
  if (modalEl.value) {
    bsModal.value = new Modal(modalEl.value, {
      backdrop: 'static'
    })
    modalEl.value.addEventListener('hide.bs.modal', () => {
      emit('update:modelValue', false)
    })
    modalEl.value.addEventListener('shown.bs.modal', () => {
      modalEl.value?.focus()
      isShown.value = true
    })
    modalEl.value.addEventListener('hidden.bs.modal', () => {
      isShown.value = false
    })
  }
})

// Hide the Modal component, before unmount, to prevent the modal background from being saved
// along with page scroll disable when pressing the back button in the browser.
onUnmounted(() => {
  hide()
})

watch(
  () => props.modelValue,
  (val) => {
    if (!bsModal.value) {
      return
    }
    if (val) {
      show()
    } else {
      hide()
    }
  },
  { immediate: true }
)

function show() {
  bsModal.value?.show()
}

function hide() {
  bsModal.value?.hide()
}

function handleCancel() {
  hide()
  emit('cancel')
}

function handleOk() {
  emit('ok')
}
</script>
