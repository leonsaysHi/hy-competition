<template>
  <div class="mb-3">
    <template v-if="props.label">
      <label class="form-label">{{ label }}</label>
    </template>
    <template v-if="!selectedOption">
      <TypeaheadComp 
        v-model="searchStr"
        :options="filteredOptions"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        @select="handleSelect"
      />
    </template>
    <template v-else>

      <div class="btn-group d-flex">
        <button class="btn btn-primary" disabled>{{ selectedOption.text }}</button>
        <button type="button" class="btn btn-danger flex-grow-0" @click="model = undefined"><span class="btn btn-close"></span></button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TypeaheadComp from '@/components/TypeaheadComp.vue'
import type { Option } from '@/types/comp-fields'
interface IProps {
  modelValue: string | undefined
  options?: Option[]
  label?: string | undefined
  placeholder?: string
  disabled?: boolean
  size?: 'lg' | 'md' | 'sm'
}
const props = withDefaults(defineProps<IProps>(), {
  options: ():Option[] => [],
  label: undefined,
  placeholder: '',
  disabled: false,
  size: 'md',
})
const emit = defineEmits(['update:modelValue', 'select'])
const searchStr = ref('')
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const selectedOption = computed(() => model.value ? props.options.find(opt => opt.value === model.value) : undefined)
const filteredOptions = computed(() => {
  return searchStr.value.length 
    ? props.options
        .filter((opt: Option) => opt.text.includes(searchStr.value))
    : []
})
const handleSelect = (opt: Option) => {
  model.value = opt.value
}
</script>