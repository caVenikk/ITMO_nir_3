<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useMetricsStore } from "@/stores/metrics";
import Table from "@/components/ui/Table.vue";
import type { MetricRow } from "@/types/metrics";
import type { Column } from "@/types/table";
import type { CSSProperties } from "vue";

const store = useMetricsStore();
const showToolFilter = ref(false);
const toolFilter = ref<Set<string>>(new Set());
const sortField = ref<keyof MetricRow | null>(null);
const sortDirection = ref<"asc" | "desc">("asc");

const uniqueTools = computed(() => [...new Set(store.metrics.map((m) => m.tool)).values()].sort());

// First apply filter, then sort
const filteredMetrics = computed(() => {
    if (toolFilter.value.size === 0) return store.metrics;
    return store.metrics.filter((m) => toolFilter.value.has(m.tool));
});

const sortedAndFilteredMetrics = computed(() => {
    const data = [...filteredMetrics.value];
    if (!sortField.value) return data;

    return data.sort((a, b) => {
        const aValue = a[sortField.value!];
        const bValue = b[sortField.value!];
        const modifier = sortDirection.value === "asc" ? 1 : -1;
        return aValue > bValue ? modifier : -modifier;
    });
});

const toggleToolFilter = (tool: string) => {
    if (toolFilter.value.has(tool)) {
        toolFilter.value.delete(tool);
    } else {
        toolFilter.value.add(tool);
    }
    toolFilter.value = new Set(toolFilter.value); // Trigger reactivity
};

const columns = [
    {
        key: "tool" as const,
        title: "Tool",
        sortable: false,
        filterable: true,
    },
    {
        key: "execution_time" as const,
        title: "Execution Time (s)",
        sortable: true,
        render: ((value: number, _item: MetricRow) => value.toFixed(3)) as (value: any, item: MetricRow) => string,
    },
    {
        key: "cpu_usage" as const,
        title: "CPU Usage (%)",
        sortable: true,
    },
    {
        key: "memory_usage" as const,
        title: "Memory (KB)",
        sortable: true,
        render: (value: number, _item: MetricRow) => value.toFixed(3),
    },
] satisfies Column<MetricRow>[];

const handleSort = (field: keyof MetricRow, direction: "asc" | "desc") => {
    sortField.value = field;
    sortDirection.value = direction;
};

const filterContainer = ref<HTMLElement | null>(null);
const dropdownStyle = ref<CSSProperties>({
    position: "fixed",
    top: "0px",
    left: "0px",
    zIndex: 1000,
});

const handleFilterClick = (event: Event) => {
    event.stopPropagation();
    showToolFilter.value = !showToolFilter.value;

    if (showToolFilter.value && filterContainer.value) {
        const rect = filterContainer.value.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const dropdownWidth = 180; // Same as width in CSS

        // Adjust left position to prevent overflow
        let leftPos = rect.left;
        if (leftPos + dropdownWidth > windowWidth) {
            leftPos = windowWidth - dropdownWidth - 16; // 16px margin from right
        }

        dropdownStyle.value = {
            position: "fixed",
            top: `${rect.bottom + 8}px`,
            left: `${leftPos}px`,
            zIndex: 1000,
        };
    }
};

const handleClickOutside = (event: Event) => {
    const container = document.querySelector(".filter-container");
    if (container && !container.contains(event.target as Node)) {
        showToolFilter.value = false;
    }
};

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
    <Table :data="sortedAndFilteredMetrics" :columns="columns" :items-per-page="5" @sort="handleSort">
        <template #header-tool="{ column }">
            <div class="filter-container" ref="filterContainer">
                <button v-if="column.filterable" class="table-filter-button" @click="handleFilterClick" type="button">
                    ⚡
                </button>
            </div>
        </template>
    </Table>
    <Teleport to="body">
        <div v-if="showToolFilter" class="filter-dropdown" :style="dropdownStyle" @click.stop>
            <div class="filter-content">
                <label v-for="tool in uniqueTools" :key="tool" class="filter-item">
                    <div class="custom-checkbox">
                        <input type="checkbox" :checked="toolFilter.has(tool)" @change="toggleToolFilter(tool)" />
                        <span class="checkbox-mark"></span>
                    </div>
                    {{ tool }}
                </label>
            </div>
        </div>
    </Teleport>
</template>

<style lang="scss" scoped>
.filter-container {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.filter-dropdown {
    width: max-content;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 100;
}

.filter-content {
    max-height: 200px;
    overflow-y: auto;
    padding: 0.25rem 0;
}

.filter-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: var(--color-hover);
    }

    .custom-checkbox {
        position: relative;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;

        input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;

            &:checked ~ .checkbox-mark {
                background-color: var(--color-primary);
                border-color: var(--color-primary);

                &::after {
                    opacity: 1;
                    transform: rotate(45deg);
                }
            }
        }

        .checkbox-mark {
            position: absolute;
            top: 0;
            left: 0;
            width: 18px;
            height: 18px;
            background-color: transparent;
            border: 2px solid var(--color-border);
            border-radius: 4px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;

            &::after {
                content: "";
                width: 5px;
                height: 8px;
                border: solid white;
                border-width: 0 2px 2px 0;
                opacity: 0;
                transform: rotate(45deg) translateY(-1px);
                transition: all 0.2s ease;
                position: static;
                margin: 0;
            }
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
