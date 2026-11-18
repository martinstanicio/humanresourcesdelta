// @ts-check
const { defineConfig } = require("eslint/config");
const angular = require("angular-eslint");
const eslint = require("@eslint/js");
const ngModuleSort = require("eslint-plugin-ng-module-sort");
const { plugin: shadcn } = require("shadcn-lint-angular");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const tailwind = require("eslint-plugin-tailwindcss");
const tseslint = require("typescript-eslint");

const spartanContracts = [
  // Alert Dialog
  {
    pattern: "/^((hlm-alert-dialog|HlmAlertDialog))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmAlertDialogAction|HlmAlertDialogAction))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmAlertDialogCancel|HlmAlertDialogCancel))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern:
      "/^((hlmAlertDialogContent|hlm-alert-dialog-content|HlmAlertDialogContent))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmAlertDialogDescription|HlmAlertDialogDescription))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern:
      "/^((hlmAlertDialogFooter|hlm-alert-dialog-footer|HlmAlertDialogFooter))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmAlertDialogHeader|hlm-alert-dialog-header|HlmAlertDialogHeader))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmAlertDialogMedia|hlm-alert-dialog-media|HlmAlertDialogMedia))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern:
      "/^((hlmAlertDialogOverlay|hlm-alert-dialog-overlay|HlmAlertDialogOverlay))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmAlertDialogTitle|HlmAlertDialogTitle))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern:
      "/^((hlmAlertDialogTrigger|hlmAlertDialogTriggerFor|HlmAlertDialogTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Avatar
  {
    pattern: "/^((hlm-avatar|HlmAvatar))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size", "w", "min-w", "max-w"],
    message: {
      layout:
        '"{{className}}" is not allowed on <{{component}}>: <{{component}}> owns its size. Use a size variant or margin here or gap on the parent for space around it.',
    },
  },
  {
    pattern: "/^((hlmAvatarBadge|hlm-avatar-badge|HlmAvatarBadge))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmAvatarFallback|HlmAvatarFallback))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern: "/^((hlmAvatarGroup|hlm-avatar-group|HlmAvatarGroup))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmAvatarGroupCount|hlm-avatar-group-count|HlmAvatarGroupCount))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern: "/^((hlmAvatarImage|HlmAvatarImage))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Badge
  {
    pattern: "/^((hlmBadge|hlm-badge|HlmBadge))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Breadcrumb
  {
    pattern: "/^((hlmBreadcrumb|HlmBreadcrumb))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlm-breadcrumb-ellipsis|HlmBreadcrumbEllipsis))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmBreadcrumbItem|HlmBreadcrumbItem))$/i",
    allow: ["layout", "spacing", "gap"],
  },
  {
    pattern: "/^((hlmBreadcrumbLink|HlmBreadcrumbLink))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern: "/^((hlmBreadcrumbList|HlmBreadcrumbList))$/i",
    allow: ["layout", "spacing", "gap"],
  },
  {
    pattern: "/^((hlmBreadcrumbPage|HlmBreadcrumbPage))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern: "/^((hlmBreadcrumbSeparator|HlmBreadcrumbSeparator))$/i",
    allow: ["layout"],
  },

  // Button
  {
    pattern: "/^((hlmBtn|hlm-button|HlmButton))$/i",
    allow: ["layout", "gap"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Calendar
  {
    pattern:
      "/^((hlm-calendar|hlm-calendar-multi|hlm-calendar-range|hlm-month-year-calendar|HlmCalendar|HlmCalendarMulti|HlmCalendarRange|HlmMonthYearCalendar))$/i",
    allow: ["layout"],
  },

  // Card
  {
    pattern: "/^((hlmCard|hlm-card|HlmCard))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmCardAction|HlmCardAction))$/i",
    allow: ["layout", "gap"],
  },
  {
    pattern: "/^((hlmCardContent|HlmCardContent))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmCardDescription|HlmCardDescription))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmCardFooter|hlm-card-footer|HlmCardFooter))$/i",
    allow: ["layout", "spacing", "border-t"],
  },
  {
    pattern: "/^((hlmCardHeader|hlm-card-header|HlmCardHeader))$/i",
    allow: ["layout", "spacing", "border-b"],
  },
  {
    pattern: "/^((hlmCardTitle|HlmCardTitle))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },

  // Combobox
  {
    pattern: "/^((hlmCombobox|hlm-combobox|HlmCombobox))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlm-combobox-chip|HlmComboboxChip))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmComboboxChipInput|HlmComboboxChipInput))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmComboboxChipRemove|HlmComboboxChipRemove))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmComboboxChips|hlm-combobox-chips|HlmComboboxChips))$/i",
    allow: ["layout", "spacing", "gap"],
  },
  {
    pattern:
      "/^((hlmComboboxContent|hlm-combobox-content|HlmComboboxContent))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmComboboxEmpty|hlm-combobox-empty|HlmComboboxEmpty))$/i",
    allow: ["layout", "typography", "spacing"],
  },
  {
    pattern: "/^((hlmComboboxGroup|HlmComboboxGroup))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlm-combobox-input|HlmComboboxInput))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlm-combobox-item|HlmComboboxItem))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmComboboxLabel|HlmComboboxLabel))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmComboboxList|HlmComboboxList))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmComboboxMultiple|hlm-combobox-multiple|HlmComboboxMultiple))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlmComboboxPlaceholder|hlm-combobox-placeholder|HlmComboboxPlaceholder))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern: "/^((hlmComboboxSeparator|HlmComboboxSeparator))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmComboboxStatus|hlm-combobox-status|HlmComboboxStatus))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern: "/^((hlm-combobox-trigger|HlmComboboxTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmComboboxValue|hlm-combobox-value|HlmComboboxValue))$/i",
    allow: ["layout", "typography"],
  },

  // Date Picker
  {
    pattern:
      "/^((hlm-date-picker|hlm-date-picker-multi|hlm-date-range-picker|hlm-month-year-picker|HlmDatePicker|HlmDatePickerMulti|HlmDateRangePicker|HlmMonthYearPicker))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmDatePickerAnchor|HlmDatePickerAnchor))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlm-date-picker-input|hlm-date-multi-input|hlm-date-range-input|hlm-month-year-input|HlmDatePickerInput|HlmDateMultiInput|HlmDateRangeInput|HlmMonthYearInput))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlm-date-picker-trigger|HlmDatePickerTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Dialog
  {
    pattern: "/^((hlm-dialog|HlmDialog))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmDialogClose|HlmDialogClose))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmDialogContent|hlm-dialog-content|HlmDialogContent))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmDialogDescription|HlmDialogDescription))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmDialogFooter|hlm-dialog-footer|HlmDialogFooter))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmDialogHeader|hlm-dialog-header|HlmDialogHeader))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmDialogOverlay|hlm-dialog-overlay|HlmDialogOverlay))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmDialogTitle|HlmDialogTitle))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmDialogTrigger|hlmDialogTriggerFor|HlmDialogTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Drawer
  {
    pattern: "/^((hlm-drawer|HlmDrawer))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmDrawerClose|HlmDrawerClose))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmDrawerContent|hlm-drawer-content|HlmDrawerContent))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmDrawerDescription|HlmDrawerDescription))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmDrawerFooter|hlm-drawer-footer|HlmDrawerFooter))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmDrawerHeader|hlm-drawer-header|HlmDrawerHeader))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmDrawerOverlay|hlm-drawer-overlay|HlmDrawerOverlay))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmDrawerTitle|HlmDrawerTitle))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmDrawerTrigger|HlmDrawerTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Dropdown Menu
  {
    pattern: "/^((hlmDropdownMenu|hlm-dropdown-menu|HlmDropdownMenu))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlmDropdownMenuCheckbox|hlmDropdownMenuCheckboxItem|hlm-dropdown-menu-checkbox-indicator|HlmDropdownMenuCheckbox|HlmDropdownMenuCheckboxIndicator))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmDropdownMenuGroup|hlm-dropdown-menu-group|HlmDropdownMenuGroup))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmDropdownMenuItem|hlm-dropdown-menu-item|hlm-dropdown-menu-item-sub-indicator|HlmDropdownMenuItem|HlmDropdownMenuItemSubIndicator))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmDropdownMenuLabel|hlm-dropdown-menu-label|HlmDropdownMenuLabel))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern:
      "/^((hlmDropdownMenuRadio|hlm-dropdown-menu-radio-indicator|HlmDropdownMenuRadio|HlmDropdownMenuRadioIndicator))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmDropdownMenuSeparator|hlm-dropdown-menu-separator|HlmDropdownMenuSeparator))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmDropdownMenuShortcut|hlm-dropdown-menu-shortcut|HlmDropdownMenuShortcut))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern:
      "/^((hlmDropdownMenuSub|hlm-dropdown-menu-sub|HlmDropdownMenuSub))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmDropdownMenuSubTrigger|HlmDropdownMenuSubTrigger))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmDropdownMenuTrigger|HlmDropdownMenuTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Field
  {
    pattern: "/^((hlmField|hlm-field|hlmFieldSet|HlmField|HlmFieldSet))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmFieldContent|hlm-field-content|HlmFieldContent))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmFieldDescription|hlm-field-description|HlmFieldDescription))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlm-field-error|HlmFieldError))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern: "/^((hlmFieldGroup|hlm-field-group|HlmFieldGroup))$/i",
    allow: ["layout", "spacing", "gap"],
  },
  {
    pattern:
      "/^((hlmFieldLabel|hlm-field-label|hlmFieldLegend|HlmFieldLabel|HlmFieldLegend))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlm-field-separator|HlmFieldSeparator))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmFieldTitle|hlm-field-title|HlmFieldTitle))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },

  // Input
  {
    pattern: "/^((hlmInput|HlmInput))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Input Group
  {
    pattern: "/^((hlmInputGroup|hlm-input-group|HlmInputGroup))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlmInputGroupAddon|hlm-input-group-addon|HlmInputGroupAddon))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmInputGroupButton|HlmInputGroupButton))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmInputGroupInput|HlmInputGroupInput))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern:
      "/^((hlmInputGroupText|hlm-input-group-text|HlmInputGroupText))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern: "/^((hlmInputGroupTextarea|HlmInputGroupTextarea))$/i",
    allow: ["layout"],
  },

  // Item
  {
    pattern: "/^((hlmItem|hlm-item|HlmItem))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmItemActions|hlm-item-actions|HlmItemActions))$/i",
    allow: ["layout", "spacing", "gap"],
  },
  {
    pattern: "/^((hlmItemContent|hlm-item-content|HlmItemContent))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmItemDescription|hlm-item-description|HlmItemDescription))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmItemFooter|hlm-item-footer|HlmItemFooter))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmItemGroup|hlm-item-group|HlmItemGroup))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmItemHeader|hlm-item-header|HlmItemHeader))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmItemMedia|hlm-item-media|HlmItemMedia))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmItemSeparator|hlm-item-separator|HlmItemSeparator))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmItemTitle|hlm-item-title|HlmItemTitle))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },

  // Label
  {
    pattern: "/^((hlmLabel|HlmLabel))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },

  // Navigation Menu
  {
    pattern: "/^((hlmNavigationMenu|hlm-navigation-menu|HlmNavigationMenu))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlmNavigationMenuContent|hlm-navigation-menu-content|HlmNavigationMenuContent))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmNavigationMenuItem|HlmNavigationMenuItem))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmNavigationMenuLink|HlmNavigationMenuLink))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern: "/^((hlmNavigationMenuList|HlmNavigationMenuList))$/i",
    allow: ["layout", "spacing", "gap"],
  },
  {
    pattern: "/^((hlmNavigationMenuTrigger|HlmNavigationMenuTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Pagination
  {
    pattern:
      "/^((hlmPagination|hlm-pagination|hlm-numbered-pagination|hlm-numbered-pagination-query-params|HlmPagination|HlmNumberedPagination|HlmNumberedPaginationQueryParams))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmPaginationContent|HlmPaginationContent))$/i",
    allow: ["layout", "spacing", "gap"],
  },
  {
    pattern: "/^((hlmPaginationItem|HlmPaginationItem))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlmPaginationLink|hlm-pagination-previous|hlm-pagination-next|HlmPaginationLink|HlmPaginationPrevious|HlmPaginationNext))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlm-pagination-ellipsis|HlmPaginationEllipsis))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Popover
  {
    pattern: "/^((hlmPopover|hlm-popover|HlmPopover))$/i",
    allow: ["layout"],
  },
  {
    pattern: "/^((hlmPopoverContent|hlm-popover-content|HlmPopoverContent))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmPopoverDescription|HlmPopoverDescription))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmPopoverHeader|hlm-popover-header|HlmPopoverHeader))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmPopoverTitle|HlmPopoverTitle))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern:
      "/^((hlmPopoverTrigger|hlmPopoverTriggerFor|HlmPopoverTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Radio Group
  {
    pattern: "/^((hlmRadioGroup|hlm-radio-group|HlmRadioGroup))$/i",
    allow: ["layout", "spacing", "gap"],
  },
  {
    pattern: "/^((hlm-radio|HlmRadio))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlm-radio-indicator|HlmRadioIndicator))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Select
  {
    pattern:
      "/^((hlmSelect|hlm-select|hlmSelectMultiple|hlm-select-multiple|HlmSelect|HlmSelectMultiple))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlm-select-content|hlm-select-values-content|HlmSelectContent|HlmSelectValuesContent))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmSelectGroup|hlm-select-group|HlmSelectGroup))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlm-select-item|HlmSelectItem))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmSelectLabel|hlm-select-label|HlmSelectLabel))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern:
      "/^((hlmSelectPlaceholder|hlm-select-placeholder|HlmSelectPlaceholder))$/i",
    allow: ["layout", "typography"],
  },
  {
    pattern:
      "/^((hlm-select-scroll-down|hlm-select-scroll-up|HlmSelectScrollDown|HlmSelectScrollUp))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlmSelectSeparator|hlm-select-separator|HlmSelectSeparator))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlm-select-trigger|HlmSelectTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmSelectValue|hlm-select-value|HlmSelectValue))$/i",
    allow: ["layout", "typography"],
  },

  // Separator
  {
    pattern: "/^((hlmSeparator|hlm-separator|HlmSeparator))$/i",
    allow: ["layout", "spacing"],
  },

  // Sheet
  {
    pattern: "/^((hlm-sheet|HlmSheet))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmSheetClose|HlmSheetClose))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmSheetContent|hlm-sheet-content|HlmSheetContent))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmSheetDescription|HlmSheetDescription))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmSheetFooter|hlm-sheet-footer|HlmSheetFooter))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmSheetHeader|hlm-sheet-header|HlmSheetHeader))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmSheetOverlay|hlm-sheet-overlay|HlmSheetOverlay))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmSheetTitle|HlmSheetTitle))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmSheetTrigger|HlmSheetTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Sidebar
  {
    pattern:
      "/^((hlm-sidebar|hlmSidebarWrapper|hlm-sidebar-wrapper|hlmSidebarRail|HlmSidebar|HlmSidebarWrapper|HlmSidebarRail))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlmSidebarContent|hlm-sidebar-content|hlmSidebarInset|HlmSidebarContent|HlmSidebarInset))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmSidebarFooter|hlm-sidebar-footer|HlmSidebarFooter))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlmSidebarGroup|hlm-sidebar-group|hlmSidebarGroupContent|HlmSidebarGroup|HlmSidebarGroupContent))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmSidebarGroupAction|HlmSidebarGroupAction))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmSidebarGroupLabel|HlmSidebarGroupLabel))$/i",
    allow: ["layout", "typography"],
    deny: ["font-*"],
  },
  {
    pattern: "/^((hlmSidebarHeader|hlm-sidebar-header|HlmSidebarHeader))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmSidebarInput|HlmSidebarInput))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern:
      "/^((hlmSidebarMenu|hlmSidebarMenuSub|HlmSidebarMenu|HlmSidebarMenuSub))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern:
      "/^((hlm-sidebar-menu-skeleton|hlmSidebarMenuSkeleton|HlmSidebarMenuSkeleton))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmSidebarMenuAction|HlmSidebarMenuAction))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern:
      "/^((hlmSidebarMenuBadge|hlm-sidebar-menu-badge|HlmSidebarMenuBadge))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern:
      "/^((hlmSidebarMenuButton|hlmSidebarMenuSubButton|HlmSidebarMenuButton|HlmSidebarMenuSubButton))$/i",
    allow: ["layout", "gap"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern:
      "/^((hlmSidebarMenuItem|hlmSidebarMenuSubItem|HlmSidebarMenuItem|HlmSidebarMenuSubItem))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlmSidebarSeparator|hlm-sidebar-separator|HlmSidebarSeparator))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmSidebarTrigger|HlmSidebarTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Skeleton
  {
    pattern: "/^((hlmSkeleton|hlm-skeleton|HlmSkeleton))$/i",
    allow: ["layout"],
  },

  // Switch
  {
    pattern: "/^((hlm-switch|HlmSwitch))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmSwitchThumb|hlm-switch-thumb|HlmSwitchThumb))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Table
  {
    pattern: "/^((hlmTableContainer|HlmTableContainer))$/i",
    allow: ["layout", "spacing"],
  },
  {
    pattern: "/^((hlmTable|HlmTable))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmTHead|hlmTableHeader|HlmTHead))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmTBody|hlmTableBody|HlmTBody))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmTFoot|hlmTableFooter|HlmTFoot))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmTr|hlmTableRow|HlmTr))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern: "/^((hlmTh|hlmTableHead|HlmTh))$/i",
    allow: ["layout", "typography", "spacing"],
  },
  {
    pattern: "/^((hlmTd|hlmTableCell|HlmTd))$/i",
    allow: ["layout", "typography", "spacing"],
  },
  {
    pattern: "/^((hlmCaption|hlmTableCaption|HlmCaption))$/i",
    allow: ["layout", "typography"],
  },

  // Tabs
  {
    pattern: "/^((hlmTabs|hlm-tabs|HlmTabs))$/i",
    allow: ["layout"],
  },
  {
    pattern:
      "/^((hlmTabsList|hlm-tabs-list|hlm-paginated-tabs-list|HlmTabsList|HlmTabsPaginatedList))$/i",
    allow: ["layout", "spacing", "gap"],
  },
  {
    pattern: "/^((hlmTabsTrigger|HlmTabsTrigger))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },
  {
    pattern:
      "/^((hlmTabsContent|hlmTabsContentLazy|HlmTabsContent|HlmTabsContentLazy))$/i",
    allow: ["layout", "spacing"],
  },

  // Textarea
  {
    pattern: "/^((hlmTextarea|HlmTextarea))$/i",
    allow: ["layout"],
    deny: ["h", "min-h", "max-h", "size"],
  },

  // Tooltip
  {
    pattern: "/^((hlmTooltip|HlmTooltip))$/i",
    allow: ["layout", "typography"],
  },
];

/** @type {import("eslint").Linter.Config["rules"]} */
const shadcnRules = {
  "shadcn/no-arbitrary-values": "error",
  "shadcn/no-inline-styles": "error",
  "shadcn/no-raw-colors": "error",
  "shadcn/no-unknown-classes": "error",
  "shadcn/require-static-classes": "error",
};

module.exports = defineConfig([
  {
    settings: {
      shadcn: {
        mergeFunctions: ["hlm", "classes"],
        themeImports: ["^@spartan-ng/brain/"],
      },
    },
  },
  {
    .../** @type {any} */ (tailwind.configs.recommended),
    files: ["**/*.ts", "**/*.html"],
    settings: {
      tailwindcss: {
        cssConfigPath: "src/styles.css",
        functions: ["hlm", "classes", "cva", "clsx", "twMerge"],
      },
    },
  },
  {
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    files: ["**/*.ts"],
    plugins: {
      "ng-module-sort": /** @type {any} */ (ngModuleSort),
      "simple-import-sort": simpleImportSort,
      shadcn,
    },
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          prefix: "app",
          style: "kebab-case",
          type: "element",
        },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          prefix: "app",
          style: "camelCase",
          type: "attribute",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "ng-module-sort/decorator-array-items": "error",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
      ...shadcnRules,
    },
  },
  {
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    files: ["**/*.html"],
    plugins: {
      shadcn,
    },
    rules: {
      "@angular-eslint/template/attributes-order": [
        "error",
        {
          alphabetical: true,
        },
      ],
      "@angular-eslint/template/button-has-type": "error",
      ...shadcnRules,
      "shadcn/no-restyle": [
        "error",
        {
          allow: ["*"],
          contracts: spartanContracts,
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**"],
    rules: {
      "shadcn/no-arbitrary-values": "off",
      "shadcn/no-restyle": "off",
    },
  },
  {
    files: ["src/components/ui/**/*.ts"],
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          prefix: "hlm",
          style: "kebab-case",
          type: "element",
        },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          prefix: "hlm",
          style: "camelCase",
          type: "attribute",
        },
      ],
      "@angular-eslint/no-input-rename": "off",
    },
  },
]);
