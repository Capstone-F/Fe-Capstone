# Category icons

Custom icons for product categories. One file per category, named by the
lowercased Be-Capstone category `code`:

| Code          | File               |
| ------------- | ------------------ |
| `CLEANSER`    | `cleanser.png`     |
| `TONER`       | `toner.png`        |
| `SERUM`       | `serum.png`        |
| `MOISTURIZER` | `moisturizer.png`  |
| `SUNSCREEN`   | `sunscreen.png`    |
| `TREATMENT`   | `treatment.png`    |

Paths are declared in `src/features/commerce/constants/product-categories.ts`
and consumed via `src/features/commerce/lib/category-mapper.ts`
(`getCategoryIcon`). Prefer SVG; PNG is fine for raster art (update the `icon`
extension in the constant to match).
