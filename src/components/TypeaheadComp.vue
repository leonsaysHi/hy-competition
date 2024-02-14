<template>
  <div class="dropdown">
    <input
      v-model="model"
      type="text"
      class="form-control"
      :class="{ [computedClass]: true }"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <div class="dropdown-menu" :class="{ show: options.length }">
      <template v-for="opt in options" :key="opt.value">
        <li>
          <a
            class="dropdown-item"
            :class="{ disabled: opt.disabled }"
            :aria-disabled="opt.disabled"
            @click="handleSelect(opt)"
            >{{ opt.text }}</a
          >
        </li>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Option } from '@/types/comp-fields'
import { computed } from 'vue'
interface IProps {
  modelValue: string
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  size?: 'lg' | 'md' | 'sm'
}
const props = withDefaults(defineProps<IProps>(), {
  options: (): Option[] => [],
  placeholder: '',
  disabled: false,
  size: 'md'
})
const emit = defineEmits(['update:modelValue', 'select'])
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const computedClass = computed(() => {
  const result = []
  if (props.size !== 'md') {
    result.push(props.size)
  }
  return result.map((str) => `btn-${str}`).join(' ')
})
const handleSelect = (opt: Option) => {
  model.value = ''
  emit('select', opt)
}
</script>
