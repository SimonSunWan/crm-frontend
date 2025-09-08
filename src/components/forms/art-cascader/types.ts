export interface ArtCascaderProps {
  dictCode: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
  filterable?: boolean
  multipleFields?: boolean
  value?: string | string[]
  separator?: string
}

export interface ArtCascaderEmits {
  change: [value: string | string[] | undefined]
  clear: []
}

export interface ArtCascaderExpose {
  focus: () => void
  blur: () => void
}
