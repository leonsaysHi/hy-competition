<template>
  <template v-if="selectedOption?.text">
    <div class="input-group">
      <InputComp v-model="selectedOption.text" readonly />
      <ButtonComp variant="light" class="border-secondary flex-grow-0" @click="model = undefined"
        ><div class="btn-close"></div
      ></ButtonComp>
    </div>
  </template>
  <template v-else>
    <TypeaheadComp
      v-model="searchStr"
      :options="filteredOptions"
      :placeholder="placeholder"
      :size="size"
      :disabled="disabled"
      @select="handleSelect"
    />
    <div class="d-flex justify-content-center">
      <InputComp
        :value="selectedOption?.value || null"
        :required="required"
        class="visually-hidden"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TypeaheadComp from '@/components/TypeaheadComp.vue'
import type { Option } from '@/types/comp-fields'
import ButtonComp from './ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
interface IProps {
  modelValue: string | undefined
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  size?: 'lg' | 'md' | 'sm'
}
const props = withDefaults(defineProps<IProps>(), {
  options: (): Option[] => [],
  placeholder: '',
  disabled: false,
  required: false,
  size: 'md'
})
const emit = defineEmits(['update:modelValue', 'select'])
const searchStr = ref('')
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const selectedOption = computed(() =>
  model.value ? props.options.find((opt) => opt.value === model.value) : undefined
)
const filteredOptions = computed(() => {
  return searchStr.value.length
    ? props.options.filter((opt: Option) =>
        opt.text.toLocaleLowerCase().includes(searchStr.value.toLocaleLowerCase())
      )
    : []
})
const handleSelect = (opt: Option) => {
  model.value = opt.value
}
</script>
