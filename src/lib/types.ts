export const EditableItemTypes: FlashItemType[] = [
    "movie clip",
    "graphic"
];


export const IgnorableLabelTypes: FlashLayerType[] = [
    "guide",
    "guided",
    "folder"
]

export function canExportLayer(layer: FlashLayer): boolean {
    return !IgnorableLabelTypes.some(t => layer.layerType == t);
}

export function canExportItem(item: FlashItem|undefined): boolean {
    if (!item) return false;
    return EditableItemTypes.some(t => item.itemType == t);
}