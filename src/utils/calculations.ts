
export const calculateEstimated1RM = (weight: number, reps: number): number => {
    if (reps <= 0 || weight <= 0) return 0;
    if (reps === 1) return weight;

    // Epley formula
    const epley = weight * (1 + reps / 30);

    // Brzycki formula
    const brzycki = weight / (1.0278 - 0.0278 * reps);

    // Lander formula
    const lander = (100 * weight) / (101.3 - 2.67123 * reps);

    // To prevent division by zero or negative results from Brzycki/Lander at high reps
    if (brzycki <= 0 || lander <= 0) {
        // Return Epley as it's more stable
        return Math.round(epley);
    }
    
    // Using an average of the three formulas for a more balanced estimation
    return Math.round((epley + brzycki + lander) / 3);
};
