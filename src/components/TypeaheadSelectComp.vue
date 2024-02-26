<template>
  <template v-if="selectedOption?.text">
    <div class="input-group">
      <div class="form-control text-bg-light">{{ selectedOption.text }}</div>
      <ButtonComp variant="light" class="border flex-grow-0" @click="model = undefined"
        ><div class="btn-close"></div
      ></ButtonComp>
    </div>
  </template>
  <template v-else>
    <div>
      <TypeaheadComp
        v-model="searchStr"
        :options="filteredOptions"
        :placeholder="placeholder"
        :size="size"
        :direction="direction"
        :disabled="disabled"
        @select="handleSelect"
      />
      <div class="d-flex justify-content-center">
        <InputComp v-model="hiddenValue" :required="required" class="visually-hidden" />
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TypeaheadComp from '@/components/TypeaheadComp.vue'
import type { Option } from '@/types/comp-fields'
import ButtonComp from './ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
import { stringIncludes } from '@/utils/strings'
interface IProps {
  modelValue: string | undefined
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  size?: 'lg' | 'md' | 'sm'
  direction?: 'down' | 'up'
}
const props = withDefaults(defineProps<IProps>(), {
  options: (): Option[] => [],
  placeholder: '',
  disabled: false,
  required: false,
  size: 'md',
  direction: 'down'
})
const emit = defineEmits(['update:modelValue', 'select'])
const searchStr = ref('')
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const hiddenValue = computed({
  get: () => model.value || '',
  set: () => {}
})
const selectedOption = computed(() =>
  model.value ? props.options.find((opt) => opt.value === model.value) : undefined
)
const filteredOptions = computed(() => {
  return searchStr.value.length
    ? props.options.filter((opt: Option) => stringIncludes(opt.text, searchStr.value))
    : []
})
const handleSelect = (opt: Option) => {
  model.value = opt.value
}
</script>
