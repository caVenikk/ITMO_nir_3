<script setup lang="ts" generic="T">
import { ref, computed } from "vue";
import type { Column, TableProps } from "@/types/table";

const props = withDefaults(defineProps<TableProps<T>>(), {
    itemsPerPage: 5,
});

const emit = defineEmits<{
    sort: [field: keyof (typeof props.data)[0], direction: "asc" | "desc"];
    filter: [field: keyof (typeof props.data)[0], value: any];
}>();

const currentPage = ref(1);
const sortField = ref<keyof (typeof props.data)[0] | null>(props.defaultSort?.field ?? null);
const sortDirection = ref<"asc" | "desc">(props.defaultSort?.direction ?? "asc");

const totalPages = computed(() => Math.ceil(props.data.length / props.itemsPerPage));

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * props.itemsPerPage;
    const end = start + props.itemsPerPage;
    return props.data.slice(start, end);
});

const toggleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    if (sortField.value === column.key) {
        sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    } else {
        sortField.value = column.key;
        sortDirection.value = "asc";
    }

    emit("sort", sortField.value, sortDirection.value);
    currentPage.value = 1;
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};
</script>

<template>
    <div class="table-wrapper">
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th v-for="column in columns" :key="column.key">
                            <div
                                class="header-content"
                                :class="{
                                    'is-sortable': column.sortable,
                                    'is-filterable': column.filterable,
                                }"
                                @click="toggleSort(column)"
                            >
                                {{ column.title }}
                                <transition name="sort-icon">
                                    <span
                                        v-if="column.sortable && sortField === column.key"
                                        class="sort-icon"
                                        :class="{ 'sort-icon--desc': sortDirection === 'desc' }"
                                    >
                                        ↑
                                    </span>
                                </transition>
                                <slot :name="`header-${String(column.key)}`" :column="column" />
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in paginatedData" :key="index">
                        <td v-for="column in columns" :key="column.key">
                            <slot :name="`cell-${String(column.key)}`" :value="item[column.key]" :item="item">
                                {{ column.render ? (column.render as any)(item[column.key], item) : item[column.key] }}
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination" v-if="totalPages > 1">
            <button :disabled="currentPage === 1" @click="prevPage">
                <svg viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            <button :disabled="currentPage === totalPages" @click="nextPage">
                <svg viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
    position: relative;
    z-index: 0;
    margin: 1rem 0;
    width: 100%;

    .table-container {
        position: relative;
        z-index: 0;
        background-color: var(--color-surface);
        border-radius: 8px;
        box-shadow: var(--shadow-sm);
        overflow: auto;
        border: 1px solid var(--color-border);

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;

            th,
            td {
                padding: 0.75rem 1rem;
                text-align: left;
                border-bottom: 1px solid var(--color-border);
                color: var(--color-text);

                &:not(:last-child) {
                    border-right: 1px solid var(--color-border);
                }
            }

            th {
                position: relative;
                z-index: 1;
                background-color: var(--color-background);
                font-weight: 600;
                color: var(--color-text-light);

                &:first-child {
                    border-top-left-radius: 8px;
                }

                &:last-child {
                    border-top-right-radius: 8px;
                }
            }

            tbody {
                tr {
                    transition: background-color 0.2s ease;

                    &:hover {
                        background-color: var(--color-hover);
                    }

                    &:last-child td {
                        border-bottom: none;

                        &:first-child {
                            border-bottom-left-radius: 8px;
                        }

                        &:last-child {
                            border-bottom-right-radius: 8px;
                        }
                    }
                }
            }
        }
    }

    .pagination {
        margin-top: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.75rem;
        color: var(--color-text);

        .page-info {
            min-width: 4rem;
            text-align: center;
            font-variant-numeric: tabular-nums;
        }

        button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            border: 1px solid var(--color-border);
            border-radius: 4px;
            background-color: var(--color-surface);
            color: var(--color-text);
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0;

            svg {
                width: 1.25rem;
                height: 1.25rem;
                fill: none;
                stroke: currentColor;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            &:hover:not(:disabled) {
                background-color: var(--color-hover);
                border-color: var(--color-text-light);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        user-select: none;
        position: relative;
        z-index: 1;

        &.is-sortable {
            cursor: pointer;

            &::after {
                content: "↕";
                opacity: 0;
                margin-left: 0.5rem;
                transition: opacity 0.2s ease;
            }

            &:hover::after {
                opacity: 0.5;
            }
        }

        &.is-filterable {
            position: relative;
        }

        .sort-icon {
            display: inline-block;
            transition: transform 0.2s ease;
            margin-left: 0.5rem;

            &--desc {
                transform: rotate(180deg);
            }
        }
    }

    :deep(.table-filter-button) {
        display: inline-flex;
        align-items: center;
        background: none;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        color: var(--color-text-light);
        opacity: 0.6;
        transition: all 0.2s ease;
        margin-left: 0.5rem;

        &:hover {
            opacity: 1;
            color: var(--color-text);
        }
    }
}

.sort-icon-enter-active,
.sort-icon-leave-active {
    transition: all 0.2s ease;
}

.sort-icon-enter-from,
.sort-icon-leave-to {
    opacity: 0;
    transform: scale(0.5);
}
</style>
