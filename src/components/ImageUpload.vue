<template>
  <div class="d-flex align-items-end gap-2">
    <InputComp
      v-model="f"
      type="file"
      placeholder="Choose a file or drop it here..."
      :disabled="disabled"
      @change="handleSelectLogo"
    ></InputComp>
    <template v-if="previewURL">
      <ImageComp
        :width="42"
        :src="previewURL"
        title="preview"
        class="border border rounded-2"
        square
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import ImageComp from '@/components/ImageComp.vue'
import InputComp from '@/components/InputComp.vue'
import { computed, ref } from 'vue'
interface IProps {
  modelValue: File | undefined
  src: string | undefined
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const emit = defineEmits(['update:modelValue'])
const f = ref('')
const handleSelectLogo = (ev: Event) => {
  const reader = new FileReader()
  const file = ev.target?.files[0]
  reader.readAsDataURL(file)
  reader.onloadend = function () {
    file.previewBase64 = reader.result
    emit('update:modelValue', file)
  }
}

const previewURL = computed(() => {
  return typeof props.modelValue === 'object'
    ? URL.createObjectURL(props.modelValue)
    : props.src || undefined
})
</script>
