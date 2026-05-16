import React, { useEffect, useRef, useState } from "react";
import { startOfWeek, format, addWeeks } from "date-fns";
import { IndianRupee, ShoppingCart } from "lucide-react";
import apiClient from "../../apiCall/api";
import { getWeekStartDate } from "../../utils/transformMealPlan";

type GroceryListProps = {
    userId: string;
    mealPlan: any; // Replace `any` with your actual mealPlan type if available
};

type GroceryItem = {
    name: string;
    quantity: string;
    price: string;
    tags: string[];
    category: string;
    collected?: boolean;
};

const categories = [
    "Vegetables",
    "Grains & Pulses",
    "Spices & Herbs",
    "Dairy & Substitutes",
    "Fruits",
    "Miscellaneous",
];



export const GroceryList: React.FC<GroceryListProps> = ({ userId, mealPlan }) => {
    const [weekStart, setWeekStart] = useState(getWeekStartDate(new Date()));
    const [items, setItems] = useState<GroceryItem[]>([]);
    const [loadingGrocery, setLoadingGrocery] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const collectedCount = items.filter((item) => item.collected).length;
    const totalCount = items.length;
    const progressPercent = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;
    //  const matchedPlan = mealPlan.find((plan : any) => plan.weekStart === weekStart)
    // const effectRan = useRef(false);


    useEffect(() => {
        if (!userId || !mealPlan || !weekStart) return;
        const matchedPlan = mealPlan.find((plan: any) => plan.weekStart === weekStart);
        if (!matchedPlan) return;

        const fetchGroceryList = async () => {
            const obj = {
                userId,
                weekStart: weekStart,
                mealPlan: [...matchedPlan.days],
            };
            setLoadingGrocery(true);
            try {
                const response = await apiClient.getGroceryList(obj);
                setItems(response.data?.itemsFlat || []);
                setHasFetched(true);
            } catch (err) {
            } finally {
                setLoadingGrocery(false);
            }
        };

        fetchGroceryList();
    }, [userId, mealPlan, weekStart, hasFetched]);

    const handleWeekChange = (weeksOffset: number) => {
        const newDate = addWeeks(new Date(weekStart), weeksOffset);
        setWeekStart(newDate.toISOString().split('T')[0]);
    };
    const handleToggleCollected = (index: number) => {
        setItems((prevItems) =>
            prevItems.map((item, i) =>
                i === index ? { ...item, collected: !item.collected } : item
            )
        );
    };

    return (
        <>
            <div>{!userId &&
                <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                    <div className="text-gray-400 mb-4">
                        <ShoppingCart size={56} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Grocery List Yet</h2>
                    <p className="text-gray-600 mb-6 max-w-md">
                        Follow these simple steps to get your personalized natural living grocery list:
                    </p>

                    <div className="max-w-2xl w-full space-y-5">
                        {[
                            {
                                title: 'Add your family members',
                                desc: 'Create individual profiles for tailored recommendations.',
                            },
                            {
                                title: 'Generate a meal plan',
                                desc: 'Our AI will create seasonal, body-type-based meals for you.',
                            },
                            {
                                title: 'Get your grocery list',
                                desc: 'Auto-generated list based on meals — shop smarter, eat better.',
                            },
                        ].map((step, idx) => (
                            <div
                                key={idx}
                                className="flex items-start space-x-4 p-4 rounded-lg bg-white border border-gray-100 shadow-sm"
                            >
                                <div className="text-green-600 font-bold text-lg">{idx + 1}.</div>
                                <div>
                                    <p className="text-gray-800 font-medium">{step.title}</p>
                                    <p className="text-sm text-gray-500">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }</div>
            {!loadingGrocery && (
                <div className="p-6 bg-green-50 min-h-screen">
                    {/* <h1 className="text-2xl font-bold mb-1 text-gray-800">Smart Grocery List</h1> */}

                    {
                        userId && <>

                            {/* Week Selector */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="px-3 py-1 rounded bg-green-100 text-green-700"
                                        onClick={() => handleWeekChange(-1)}
                                    >
                                        ◀ Prev
                                    </button>
                                    <div className="font-medium text-gray-800">
                                        Week of {format(weekStart, "dd MMM yyyy")}
                                    </div>
                                    <button
                                        className="px-3 py-1 rounded bg-green-100 text-green-700"
                                        onClick={() => handleWeekChange(1)}
                                    >
                                        Next ▶
                                    </button>
                                </div>
                                {/* <div className="flex gap-3">
                                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-md">
                                        ⬇ Export PDF
                                    </button>
                                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-md">
                                        📤 Share on WhatsApp
                                    </button>
                                </div> */}
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <SummaryCard label="Total Items" value={items.length.toString()} />
                                {/* <SummaryCard label="Seasonal Items" value="2" highlight /> */}
                                <SummaryCard label="Estimated Total" value={`₹${items.reduce((total, item) => total + parseInt(item.price.replace("₹", ""), 10), 0)}`} />
                                <SummaryCard label="Collected" value={`${collectedCount}/${items.length}`} />
                            </div>

                            {/* Progress Bar */}
                            <div className="bg-gray-100 p-4 rounded mb-6">
                                <div className="text-sm text-gray-600 mb-1">Shopping Progress</div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-green-500 h-2.5 rounded-full"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm mt-1 text-right text-gray-500">
                                    {progressPercent}% Complete
                                </p>
                            </div>

                            {/* No Items Message */}
                            {userId && !hasFetched && items.length === 0 && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-6 rounded-lg text-center">
                                    <h2 className="text-lg font-semibold mb-2">No Meal Plan Found</h2>
                                    <p className="text-sm">
                                        Please generate a meal plan for the selected week to view your grocery list.
                                    </p>
                                </div>
                            )}

                            {/* Grocery Categories */}
                            {categories.map((cat) => {
                                const filtered = items.filter((item) => item.category === cat);
                                if (filtered.length === 0) return null;

                                return (
                                    <div
                                        key={cat}
                                        className="bg-green-50 border border-green-200 rounded-xl mb-6 shadow-sm"
                                    >
                                        <h3 className="text-lg font-semibold px-4 pt-4 text-green-700">
                                            {cat} ({filtered.length} {filtered.length > 1 ? "Items" : "Item"})
                                        </h3>
                                        <div className="divide-y mt-2">
                                            {filtered.map((item, i) => {
                                                const globalIndex = items.findIndex(
                                                    (itm) => itm.name === item.name && itm.category === item.category
                                                );
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`px-4 py-4 bg-white flex justify-between items-center transition-all duration-300 ${item.collected ? "opacity-60" : ""
                                                            }`}
                                                    >
                                                        <div>
                                                            <div className="font-medium text-gray-800">{item.name}</div>
                                                            <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-sm font-semibold text-green-800 whitespace-nowrap">
                                                                {item.price}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={item.collected || false}
                                                                onChange={() => handleToggleCollected(globalIndex)}
                                                                className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                                title="Mark as collected"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </>

                    }
                </div>)}
            {loadingGrocery && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-lg">
                        <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Loading grocery...</span>
                    </div>
                </div>
            )}
        </>
    );
};

const SummaryCard = ({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) => {
    return (
        <div
            className={`rounded-lg p-4 shadow-md ${highlight ? "bg-green-100 text-green-700" : "bg-white"
                }`}
        >
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
};
