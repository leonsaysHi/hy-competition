<template>
    <div class="wrapper" :style="computedStyles">
      <table>
        <thead>
          <div></div>
          <div></div>
          <tr>
            <th
              v-for="(col, idx) in headers"
              :style="{ gridArea: getGridAreaName(undefined, idx) }"
              :key="col.key"
            >
              {{ col.label || col.key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <div></div>
          <div></div>
          <tr v-for="(row, ridx) in items" :key="`row-${ridx}`">
            <td
              v-for="(col, idx) in headers"
              :style="{ gridArea: getGridAreaName(ridx, idx) }"
              :key="`cel-${idx}-${col.key}`"
            >
              {{ row[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';

interface Props {
  headers?: []
  items?: []
  horizontalSpaces?: number
}
const props = withDefaults(defineProps<Props>(), {
    headers: () => [],
    items: () =>[],
    horizontalSpaces: 20
})

const computedStyles = computed(() => {
        /*const gridTemplateColumns = [
          ...this.headers.map((col) => "minmax(150px, 1fr)"),
        ].join(" ");*/
        const gridTemplateColumns = `${props.horizontalSpaces}px ${props.headers
          .map(() => `auto`)
          .join(` `)} ${props.horizontalSpaces}px`;
        const gridTemplateRows = `auto`;
        const areasRows = [
          `h-s-spacer ${props.headers
            .map((h, idx) => getGridAreaName(undefined, idx))
            .join(` `)} h-e-spacer`,
          ...props.items.map(
            (r, ridx) =>
              `b-s-spacer ${props.headers
                .map((h, idx) => getGridAreaName(ridx, idx))
                .join(` `)} b-e-spacer`
          ),
        ];
        const gridTemplateAreas = [`'`, areasRows.join(`' '`), `'`].join("");
        return {
          gridTemplateColumns,
          gridTemplateRows,
          gridTemplateAreas,
        };
      })

const  getGridAreaName = (ridx, idx) => {
    const gridArea = ["cell"];
    if (ridx !== undefined) {
        gridArea.push(ridx);
    }
    gridArea.push(idx);
    return gridArea.join("-");
}
  </script>
  
  <style scoped>
  .wrapper {
    display: grid;
  }
  
  table {
    border-collapse: collapse;
    min-width: 100%;
  }
  table,
  thead,
  tbody,
  tr {
    display: contents;
  }
  
  thead > div:nth-child(1) {
    grid-area: "h-s-spacer";
  }
  thead > div:nth-child(2) {
    grid-area: "h-e-spacer";
  }
  tbody > div:nth-child(1) {
    grid-area: "b-s-spacer";
  }
  tbody > div:nth-child(2) {
    grid-area: "b-e-spacer";
  }
  
  th,
  td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  th,
  thead > div {
    position: sticky;
    top: 0;
  }
  
  tr:nth-child(even) td:not(.spacer) {
    background: #f8f6ff;
  }
  </style>
  