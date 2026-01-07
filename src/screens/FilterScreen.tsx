import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryFilter } from "../components/CategoryFilter";
import { MealCard } from "../components/MealCard";
import { RootStackParamList } from "../navigation/StackNavigator";
import { Meal } from "../types/Meal";

type Props = NativeStackScreenProps<RootStackParamList, "Filters">;

export function FilterScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);

  // Fetch categories
  useEffect(() => {
    setLoadingCategories(true);
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.meals.map((c: any) => c.strCategory));
        setLoadingCategories(false);
      })
      .catch(() => setLoadingCategories(false));
  }, []);

  // Fetch meals for selected category
  useEffect(() => {
    if (!selectedCategory) {
      setMeals([]);
      return;
    }

    setLoadingMeals(true);
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => {
        const mapped: Meal[] = data.meals.map((m: any) => ({
          idMeal: m.idMeal,
          strMeal: m.strMeal,
          strCategory: selectedCategory,
          strArea: "",
          strInstructions: "",
          strMealThumb: m.strMealThumb,
          strYoutube: "",
          strSource: "",
          ingredients: [],
        }));
        setMeals(mapped);
        setLoadingMeals(false);
      })
      .catch(() => setLoadingMeals(false));
  }, [selectedCategory]);

  // Fetch full meal details
  async function handleMealPress(id: string) {
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await res.json();
      const apiMeal = data.meals[0];

      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = apiMeal[`strIngredient${i}`];
        const measure = apiMeal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          ingredients.push({ ingredient, measure });
        }
      }

      const meal: Meal = {
        idMeal: apiMeal.idMeal,
        strMeal: apiMeal.strMeal,
        strCategory: apiMeal.strCategory,
        strArea: apiMeal.strArea,
        strInstructions: apiMeal.strInstructions,
        strMealThumb: apiMeal.strMealThumb,
        strYoutube: apiMeal.strYoutube,
        strSource: apiMeal.strSource,
        ingredients,
      };

      navigation.navigate("Meal", { meal });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen title */}
        <Text className="mb-4 text-3xl font-bold text-white">Filter Meals</Text>

        {/* Placeholder text at the top */}
        {!loadingCategories && meals.length === 0 && (
          <Text className="mb-4 text-lg text-zinc-400">
            Select a category to see meals.
          </Text>
        )}

        {/* Categories */}
        {loadingCategories ? (
          <ActivityIndicator size="large" color="#34D399" className="my-4" />
        ) : (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            vertical={meals.length === 0} // vertical if no meals
          />
        )}

        {/* Meals */}
        {loadingMeals && (
          <View className="items-center justify-center mt-6">
            <ActivityIndicator size="large" color="#34D399" />
          </View>
        )}

        {meals.length > 0 && (
          <FlatList
            data={meals}
            keyExtractor={(item) => item.idMeal}
            renderItem={({ item }) => <MealCard meal={item} onPress={() => handleMealPress(item.idMeal)} />}
            contentContainerStyle={{ paddingTop: 12 }}
            scrollEnabled={false} // FlatList inside ScrollView
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
