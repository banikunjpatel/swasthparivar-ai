from app.logic.filter_meal_plan import filter_meal_plan

def test_filter_meal_plan_flags_and_modifies():
    sample_meal_plan = {
        "Monday": {
            "breakfast": "Gulab Jamun with milk",
            "lunch": "Papad with rice",
            "dinner": "Mixed vegetable curry"
        },
        "Tuesday": {
            "breakfast": "Poha",
            "lunch": "Spinach paratha",
            "dinner": "Curd rice"
        }
    }

    conditions = ["diabetes", "hypertension", "joint_pain"]

    filtered = filter_meal_plan(sample_meal_plan, conditions)

    # ✅ Gulab Jamun should be flagged and modified
    breakfast = filtered["Monday"]["breakfast"]
    assert breakfast["compliance"] == "modified"
    assert "gulab jamun" in breakfast["original_dish"].lower()
    assert "fruit salad" in breakfast["dish"].lower()
    assert "diabetes: gulab jamun" in breakfast["warnings"]

    # ✅ Papad should be flagged and modified
    lunch = filtered["Monday"]["lunch"]
    assert lunch["compliance"] == "modified"
    assert "papad" in lunch["original_dish"].lower()
    assert "roasted chana" in lunch["dish"].lower()

    # ✅ Curd should be flagged but not substituted
    dinner = filtered["Tuesday"]["dinner"]
    assert dinner["compliance"] == "unsafe"
    assert "curd" in dinner["dish"].lower()
    assert dinner["modified"] is False

    # ✅ Safe dish
    poha = filtered["Tuesday"]["breakfast"]
    assert poha["compliance"] == "safe"
    assert poha["warnings"] == []
    assert poha["modified"] is False