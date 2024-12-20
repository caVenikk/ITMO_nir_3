export interface Column<T> {
    key: keyof T;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, item: T) => string;
}

export interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    itemsPerPage?: number;
    defaultSort?: {
        field: keyof T;
        direction: "asc" | "desc";
    };
}
