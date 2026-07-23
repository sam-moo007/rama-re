## Core Funnel Events

| Event Name | Trigger | Properties | Phase |
|------------|---------|------------|-------|
| `discovery.view` | `/homes` page load | `filter_count`, `has_brief` | 3 |
| `discovery.filter.apply` | Click "Apply" on filters | `primary_filters[]`, `advanced_filters[]` | 3 |
| `property.save` | Click heart/save icon | `property_slug`, `auth_state` (guest/user) | 2,4 |
| `property.verify.expand` | Click "View verified details" | `property_slug`, `verified_count` | 2 |
| `costs.calculator.interact` | Adjust any slider/input | `field_name`, `value` | 5 |
| `costs.assumption.view` | Click assumption tooltip | `line_item_key` | 5 |
| `compare.add` | Add property to comparison | `property_slug`, `compare_count` | 6 |
| `auth.deferred.trigger` | Auth modal shown | `trigger_action`, `cooldown_active` | 4 |
| `auth.deferred.convert` | User completes auth after modal | `trigger_action`, `time_since_modal` | 4 |
| `auth.deferred.dismiss` | User dismisses auth modal | `trigger_action` | 4 |
