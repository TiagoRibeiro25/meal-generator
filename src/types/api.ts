export type ApiCategory = {
    strCategory: string;
};

export type ApiMealSummary = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
};

export type ApiMealDetail = {
    idMeal: string;
    strMeal: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strYoutube: string;
    strSource: string;
    [key: `strIngredient${number}`]: string;
    [key: `strMeasure${number}`]: string;
};

export type ApiResponse<T> = {
    meals: T[] | null;
};
