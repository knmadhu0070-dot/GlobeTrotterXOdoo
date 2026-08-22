function BudgetSummary({ trip, cities }) {

    const tripBudget = Number(trip?.budget || 0);


    // ---------------------------------------------------------
    // Calculate total estimated activity cost
    // ---------------------------------------------------------

    const activityCost = cities.reduce(
        (cityTotal, city) => {

            const activities =
                Array.isArray(city.activities)
                    ? city.activities
                    : [];

            const cityCost = activities.reduce(
                (total, activity) => {

                    return (
                        total +
                        Number(
                            activity.estimated_cost || 0
                        )
                    );

                },
                0
            );

            return cityTotal + cityCost;

        },
        0
    );


    const remaining =
        tripBudget - activityCost;

    const isOverBudget =
        remaining < 0;


    const activityCount =
        cities.reduce(
            (total, city) => {

                const activities =
                    Array.isArray(city.activities)
                        ? city.activities
                        : [];

                return (
                    total +
                    activities.length
                );

            },
            0
        );


    return (

        <section className="budget-section">

            <div className="budget-header">

                <p className="eyebrow">
                    BUDGET
                </p>

                <h2>
                    Trip budget
                </h2>

                <p className="page-subtitle">
                    Track your planned activity expenses.
                </p>

            </div>


            <div className="budget-card">

                <div className="budget-row">

                    <div>

                        <span className="budget-label">
                            Trip Budget
                        </span>

                        <span className="budget-description">
                            Your total planned budget
                        </span>

                    </div>

                    <strong>
                        ₹{tripBudget.toLocaleString("en-IN")}
                    </strong>

                </div>


                <div className="budget-row">

                    <div>

                        <span className="budget-label">
                            Planned Activity Cost
                        </span>

                        <span className="budget-description">
                            {activityCount}{" "}
                            {activityCount === 1
                                ? "activity"
                                : "activities"}
                        </span>

                    </div>

                    <strong>
                        ₹{activityCost.toLocaleString("en-IN")}
                    </strong>

                </div>


                <div className="budget-divider" />


                <div
                    className={
                        `budget-total ${
                            isOverBudget
                                ? "budget-over"
                                : "budget-remaining"
                        }`
                    }
                >

                    <div>

                        <span className="budget-label">
                            {isOverBudget
                                ? "Over Budget"
                                : "Remaining Budget"}
                        </span>

                    </div>

                    <strong>
                        ₹{Math.abs(
                            remaining
                        ).toLocaleString("en-IN")}
                    </strong>

                </div>

            </div>

        </section>

    );
}


export default BudgetSummary;