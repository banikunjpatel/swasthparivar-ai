from app.logic.combine_family_plans import combine_family_plans

def test_combine_family_plans_with_substitution_and_conflict():
    # ✅ Sample family input with shared, substituted, and conflicting meals
    family_input = {
        "Anita": {
            "Monday": {
                "breakfast": "Poha",
                "lunch": "Paneer Curry"
            }
        },
        "Ramesh": {
            "Monday": {
                "breakfast": "Poha",  # ✅ same → should merge
                "lunch": "Chicken Curry"  # 🟨 substitution case
            }
        },
        "Amit": {
            "Monday": {
                "breakfast": "Upma",  # ❌ conflict
                "lunch": "Dal Fry"  # ❌ conflict
            }
        }
    }

    result = combine_family_plans(family_input)

    # ✅ Check Poha merged
    assert result["Monday"]["breakfast"]["dish"].lower() == "poha"
    assert set(result["Monday"]["breakfast"]["members"]) == {"Anita", "Ramesh"}
    assert "conflicts" in result["Monday"]["breakfast"]  # because "Upma" by Amit

    # ✅ Substitution check for lunch
    lunch = result["Monday"]["lunch"]
    assert lunch["dish"].lower() == "paneer curry"
    assert "Anita" in lunch["members"]
    assert any("Ramesh prefers Chicken Curry" in c for c in lunch["conflicts"])

    # ✅ Conflict resolution triggered for Amit
    assert any("Amit prefers Dal Fry" in c for c in lunch["conflicts"])