<template>
  <div id="app">
    <h1>Pet Meal Manager</h1>

    <!-- Cats Section -->
    <section>
      <h2>Cats</h2>
      <div>
        <input v-model="newCatName" placeholder="Enter cat name" />
        <button @click="addCat">Add Cat</button>
      </div>
      <h3>Existing Cats:</h3>
      <ul>
        <li v-for="cat in cats" :key="cat.id">{{ cat.name }}</li>
      </ul>
    </section>

    <!-- Food Types Section -->
    <section>
      <h2>Food Types</h2>
      <div>
        <input v-model="newFoodTypeName" placeholder="Food type name" />
        <input type="number" v-model.number="newFoodTypeCaloriesPerGram" placeholder="Calories per gram" />
        <button @click="addFoodType">Add Food Type</button>
      </div>
      <h3>Available Food Types:</h3>
      <ul>
        <li v-for="foodType in foodTypes" :key="foodType.id">
          {{ foodType.name }} ({{ foodType.caloriesPerGram }} kcal/g)
        </li>
      </ul>
    </section>

    <!-- Meal Recording Section -->
    <section>
      <h2>Record Meal</h2>
      <div>
        <label for="cat-select">Select Cat:</label>
        <select v-model="selectedCatId" id="cat-select">
          <option disabled value="">Please select one</option>
          <option v-for="cat in cats" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div>
        <label for="food-type-select">Select Food Type:</label>
        <select v-model="selectedFoodTypeId" id="food-type-select" @change="handleFoodTypeChange">
          <option disabled value="">Please select one</option>
          <option v-for="foodType in foodTypes" :key="foodType.id" :value="foodType.id">
            {{ foodType.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="meal-time">Meal Time:</label>
        <input type="datetime-local" v-model="mealTimestamp" id="meal-time" />
      </div>
      <div>
        <label>Input Mode:</label>
        <input type="radio" id="grams-mode" value="grams" v-model="inputMode" />
        <label for="grams-mode">Grams</label>
        <input type="radio" id="calories-mode" value="calories" v-model="inputMode" />
        <label for="calories-mode">Calories</label>
      </div>
      <div>
        <label v-if="inputMode === 'grams'" for="amount-grams">Amount (grams):</label>
        <input v-if="inputMode === 'grams'" type="number" v-model.number="mealAmountGrams" @input="calculateCalories" id="amount-grams" placeholder="Grams" />
        <span v-if="inputMode === 'grams' && selectedFoodType">Calculated Calories: {{ calculatedCaloriesForDisplay }} kcal</span>
      </div>
      <div>
        <label v-if="inputMode === 'calories'" for="amount-calories">Amount (calories):</label>
        <input v-if="inputMode === 'calories'" type="number" v-model.number="mealAmountCalories" @input="calculateGrams" id="amount-calories" placeholder="Calories" />
        <span v-if="inputMode === 'calories' && selectedFoodType">Calculated Grams: {{ calculatedGramsForDisplay }} g</span>
      </div>
       <div>
        Quick Amounts:
        <button @click="setQuickAmount(10, 'grams')">10g</button>
        <button @click="setQuickAmount(20, 'grams')">20g</button>
        <button @click="setQuickAmount(50, 'grams')">50g</button>
        <button @click="setQuickAmount(100, 'calories')">100kcal</button>
      </div>
      <button @click="recordMeal" :disabled="!selectedCatId || !selectedFoodTypeId">Record Meal</button>
    </section>

    <!-- Meal History Section -->
    <section>
      <h2>Meal History</h2>
      <div>
        <label for="history-cat-select">Select Cat for History:</label>
        <select v-model="historySelectedCatId" @change="fetchMealHistory" id="history-cat-select">
          <option disabled value="">Please select one</option>
          <option v-for="cat in cats" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Food</th>
            <th>Amount (g)</th>
            <th>Calories (kcal)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="meal in mealHistory" :key="meal.id">
            <td>{{ new Date(meal.timestamp).toLocaleString() }}</td>
            <td>{{ meal.foodType.name }}</td>
            <td>{{ meal.amountGrams.toFixed(1) }}</td>
            <td>{{ meal.calories.toFixed(1) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

// State for Cats
const newCatName = ref('');
const cats = ref([]);

// State for Food Types
const newFoodTypeName = ref('');
const newFoodTypeCaloriesPerGram = ref(null);
const foodTypes = ref([]);

// State for Meal Recording
const selectedCatId = ref('');
const selectedFoodTypeId = ref('');
const mealTimestamp = ref(new Date().toISOString().slice(0, 16)); // Default to now
const inputMode = ref('grams'); // 'grams' or 'calories'
const mealAmountGrams = ref(null);
const mealAmountCalories = ref(null);
const selectedFoodType = computed(() => foodTypes.value.find(ft => ft.id === selectedFoodTypeId.value));

// State for Meal History
const historySelectedCatId = ref('');
const mealHistory = ref([]);

// Fetch initial data
async function fetchCats() {
  try {
    const response = await $fetch('/api/cats');
    cats.value = response;
  } catch (error) {
    console.error('Error fetching cats:', error);
  }
}

async function fetchFoodTypes() {
  try {
    const response = await $fetch('/api/foodtypes');
    foodTypes.value = response;
  } catch (error) {
    console.error('Error fetching food types:', error);
  }
}

async function fetchMealHistory() {
  if (!historySelectedCatId.value) {
    mealHistory.value = [];
    return;
  }
  try {
    const response = await $fetch(`/api/meals?catId=${historySelectedCatId.value}`);
    mealHistory.value = response;
  } catch (error) {
    console.error('Error fetching meal history:', error);
  }
}

// Add Cat
async function addCat() {
  if (!newCatName.value.trim()) return;
  try {
    const newCat = await $fetch('/api/cats', {
      method: 'POST',
      body: { name: newCatName.value },
    });
    cats.value.push(newCat);
    newCatName.value = '';
  } catch (error) {
    console.error('Error adding cat:', error);
  }
}

// Add Food Type
async function addFoodType() {
  if (!newFoodTypeName.value.trim() || !newFoodTypeCaloriesPerGram.value || newFoodTypeCaloriesPerGram.value <= 0) {
    alert('Please enter a valid food type name and positive calories per gram.');
    return;
  }
  try {
    const newFoodType = await $fetch('/api/foodtypes', {
      method: 'POST',
      body: {
        name: newFoodTypeName.value,
        caloriesPerGram: parseFloat(newFoodTypeCaloriesPerGram.value),
      },
    });
    foodTypes.value.push(newFoodType);
    newFoodTypeName.value = '';
    newFoodTypeCaloriesPerGram.value = null;
  } catch (error) {
    console.error('Error adding food type:', error);
  }
}

// Meal Calculation Logic
function calculateCalories() {
  if (inputMode.value === 'grams' && selectedFoodType.value && mealAmountGrams.value != null) {
    mealAmountCalories.value = mealAmountGrams.value * selectedFoodType.value.caloriesPerGram;
  }
}

function calculateGrams() {
  if (inputMode.value === 'calories' && selectedFoodType.value && mealAmountCalories.value != null && selectedFoodType.value.caloriesPerGram > 0) {
    mealAmountGrams.value = mealAmountCalories.value / selectedFoodType.value.caloriesPerGram;
  }
}

const calculatedCaloriesForDisplay = computed(() => {
  if (selectedFoodType.value && mealAmountGrams.value != null) {
    return (mealAmountGrams.value * selectedFoodType.value.caloriesPerGram).toFixed(1);
  }
  return 'N/A';
});

const calculatedGramsForDisplay = computed(() => {
  if (selectedFoodType.value && mealAmountCalories.value != null && selectedFoodType.value.caloriesPerGram > 0) {
    return (mealAmountCalories.value / selectedFoodType.value.caloriesPerGram).toFixed(1);
  }
  return 'N/A';
});

watch(inputMode, () => {
  // Reset amounts when mode changes to avoid stale calculated values
  // mealAmountGrams.value = null;
  // mealAmountCalories.value = null;
  // Decided against resetting, user might want to switch mode to see the other value
  if (inputMode.value === 'grams') calculateCalories();
  else calculateGrams();
});


function handleFoodTypeChange() {
  // Recalculate when food type changes
  if (inputMode.value === 'grams') {
    calculateCalories();
  } else {
    calculateGrams();
  }
}

function setQuickAmount(amount, mode) {
  inputMode.value = mode;
  if (mode === 'grams') {
    mealAmountGrams.value = amount;
    calculateCalories();
  } else {
    mealAmountCalories.value = amount;
    calculateGrams();
  }
}

// Record Meal
async function recordMeal() {
  if (!selectedCatId.value || !selectedFoodTypeId.value) {
    alert('Please select a cat and a food type.');
    return;
  }
  if (mealAmountGrams.value == null || mealAmountGrams.value <= 0) {
    alert('Please enter a valid amount for the meal.');
    return;
  }

  // Ensure calories are calculated if grams is the primary input
  if (inputMode.value === 'grams') {
    calculateCalories();
  } else if (inputMode.value === 'calories') {
    // Ensure grams are calculated if calories is the primary input
    calculateGrams();
    if (mealAmountGrams.value == null || mealAmountGrams.value <= 0) {
        alert('Calculated grams is invalid. Check food calories per gram.');
        return;
    }
  }


  try {
    const mealToRecord = {
      catId: selectedCatId.value,
      foodTypeId: selectedFoodTypeId.value,
      amountGrams: parseFloat(mealAmountGrams.value),
      // calories: parseFloat(mealAmountCalories.value), // API calculates this
      timestamp: new Date(mealTimestamp.value).toISOString(),
    };

    const newMeal = await $fetch('/api/meals', {
      method: 'POST',
      body: mealToRecord,
    });

    // If meal history is currently shown for the cat that just ate, refresh it
    if (historySelectedCatId.value === selectedCatId.value) {
      fetchMealHistory();
    }

    // Reset form (optional)
    // selectedCatId.value = '';
    // selectedFoodTypeId.value = '';
    mealAmountGrams.value = null;
    mealAmountCalories.value = null;
    mealTimestamp.value = new Date().toISOString().slice(0, 16);


  } catch (error) {
    console.error('Error recording meal:', error);
    alert('Failed to record meal. Check console for details.');
  }
}

// Lifecycle hook
onMounted(() => {
  fetchCats();
  fetchFoodTypes();
  // Set default meal timestamp to current time accurately
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone for datetime-local input
  mealTimestamp.value = now.toISOString().slice(0,16);
});

</script>

<style>
body {
  font-family: sans-serif;
  line-height: 1.6;
  margin: 0;
  background-color: #f4f4f4;
  color: #333;
}

#app {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

h1, h2, h3 {
  color: #333;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

h2 {
  border-bottom: 2px solid #42b983;
  padding-bottom: 10px;
  margin-top: 0;
}

input[type="text"],
input[type="number"],
input[type="datetime-local"],
select {
  padding: 8px;
  margin: 5px 5px 5px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px 0;
}

button:hover {
  background-color: #36a476;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f0f0f0;
}

label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}

div > label:first-child {
  /* More spacing for top-level labels in a div */
  margin-top: 10px;
}

span { /* For calculated values */
  margin-left: 10px;
  font-style: italic;
  color: #555;
}
</style>
