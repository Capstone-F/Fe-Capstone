import { Product, IngredientConflict } from "@/types/domain";
import { INGREDIENT_CONFLICTS } from "../data/mock-catalog";

/**
 * Detect ingredient conflicts across a set of products (cart or detail-vs-cart).
 * Returns one entry per conflicting product pair+rule. This is a WARNING signal,
 * never a hard block (see business rule 08 e-commerce cart behavior).
 */
export function detectCartConflicts(products: Product[]): IngredientConflict[] {
  const conflicts: IngredientConflict[] = [];
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const p1 = products[i];
      const p2 = products[j];
      for (const rule of INGREDIENT_CONFLICTS) {
        const forward =
          p1.ingredients.includes(rule.a) && p2.ingredients.includes(rule.b);
        const backward =
          p1.ingredients.includes(rule.b) && p2.ingredients.includes(rule.a);
        if (forward || backward) {
          conflicts.push({
            a: rule.a,
            b: rule.b,
            productA: p1.name,
            productB: p2.name,
            reason: rule.reason,
          });
        }
      }
    }
  }
  return conflicts;
}
