<template>
  <div class="character-container">
    <!-- Left Column: Class Selection -->
    <div class="class-section">
      <div class="form-group">
        <select
          id="class"
          v-model="selectedClass"
          class="form-select"
          @change="onClassChange"
        >
          <option value="" disabled selected>Select a class</option>
          <option v-for="cls in classes" :key="cls.name" :value="cls">
            {{ cls.name }}
          </option>
        </select>
        <label for="class" class="form-label">Class</label>
      </div>

      <!-- Domain Display Section -->
      <div v-if="selectedClass" class="domains-container">
        <div class="domain-pill" v-if="selectedClass.domain_1">
          <span class="domain-label">Primary Domain:</span>
          <span class="domain-value">{{ formatDomain(selectedClass.domain_1) }}</span>
        </div>
        <div class="domain-pill" v-if="selectedClass.domain_2">
          <span class="domain-label">Secondary Domain:</span>
          <span class="domain-value">{{ formatDomain(selectedClass.domain_2) }}</span>
        </div>
      </div>
    </div>

    <!-- Right Column: Character Details -->
    <div class="character-details">
      <div class="form-row">
        <div class="form-group" style="flex: 2; position: relative;">
          <input
            type="text"
            id="characterName"
            v-model="character.name"
            class="form-input"
            placeholder=" "
            style="padding-right: 40px;"
          >
          <button 
            type="button" 
            class="random-name-button" 
            @click="generateRandomName"
            title="Generate random name"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
              <path d="M16 16h5v5"></path>
            </svg>
          </button>
          <label for="characterName" class="form-label"></label>
        </div>
        <div class="form-group" style="flex: 1;">
          <input
            type="text"
            id="pronouns"
            v-model="character.pronouns"
            class="form-input"
            placeholder=" "
          >
          <label for="pronouns" class="form-label">Pronouns</label>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <select
            id="heritage"
            v-model="character.heritage"
            class="form-select"
          >
            <option value="" disabled selected>Select heritage</option>
            <option v-for="heritage in heritages" :key="heritage" :value="heritage">
              {{ heritage }}
            </option>
          </select>
          <label for="heritage" class="form-label">Heritage</label>
        </div>
        <div class="form-group" style="flex: 1;">
          <select
            id="subclass"
            v-model="character.subclass"
            class="form-select"
            :disabled="!selectedClass"
          >
            <option value="" disabled selected>Select subclass</option>
            <option v-if="selectedClass" :value="selectedClass.subclass_1">
              {{ selectedClass.subclass_1 }}
            </option>
            <option v-if="selectedClass && selectedClass.subclass_2" 
                   :value="selectedClass.subclass_2">
              {{ selectedClass.subclass_2 }}
            </option>
          </select>
          <label for="subclass" class="form-label">Subclass</label>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Script section remains the same as before -->
<script setup>
import { ref, onMounted, watch } from 'vue'
import classesData from '../../assets/data/classes.json'
import namesData from '../../assets/data/names.json'

const emit = defineEmits(['class-selected', 'domains-selected', 'character-update'])

// Refs
const classes = ref(classesData)
const selectedClass = ref('')
const heritages = ref(['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Tiefling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc'])

const character = ref({
  name: '',
  pronouns: '',
  heritage: '',
  subclass: ''
})

// Format domain names for display
const formatDomain = (domain) => {
  return domain?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || ''
}

// Handle class selection
const onClassChange = () => {
  if (selectedClass.value) {
    emit('class-selected', selectedClass.value)
    emit('domains-selected', {
      primary: selectedClass.value.domain_1,
      secondary: selectedClass.value.domain_2
    })
    // Reset subclass when class changes
    character.value.subclass = ''
  }
}

// Watch for character changes
watch(character, (newValue) => {
  emit('character-update', newValue)
}, { deep: true })

// Generate random name
const generateRandomName = () => {
  const firstNames = namesData.characterNames
  const lastNames = namesData.lastNames
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  character.value.name = `${firstName} ${lastName}`
}

// Initialize
onMounted(() => {
  selectedClass.value = ''
  generateRandomName()
})
</script>

<style scoped>
/* Base Styles */
.character-container {
  display: flex;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.class-section {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.character-details {
  flex: 2;
  min-width: 300px;
}

/* Form Group Styles */
.form-group {
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
}

.form-select, .form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
  height: 45px;
  cursor: pointer;
}

.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  appearance: none;
}

.form-input {
  cursor: text;
}

.form-input:focus,
.form-select:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-select::-ms-expand {
  display: none;
}

.form-label {
  position: absolute;
  top: 12px;
  left: 16px;
  color: #6c757d;
  background: white;
  padding: 0 4px;
  transition: all 0.2s ease;
  pointer-events: none;
  transform-origin: left top;
}

.form-select:focus + .form-label,
.form-select:not([value=""]) + .form-label,
.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  transform: translateY(-1.5rem) scale(0.85);
  color: #007bff;
  left: 12px;
  padding: 0 4px;
}

/* Domain Styles */
.domains-container {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.domain-pill {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.domain-pill:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.domain-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.domain-value {
  font-weight: 600;
  color: #212529;
  text-transform: capitalize;
}

/* Form Row Styles */
.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
}

.form-row .form-group {
  margin-bottom: 0;
  flex: 1;
  min-width: 0;
}

/* Random Name Button Styles */
.random-name-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.random-name-button:hover {
  color: #007bff;
  background-color: rgba(0, 0, 0, 0.05);
}

.random-name-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Responsive Design */
@media (max-width: 768px) {
  .character-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .class-section,
  .character-details {
    width: 100%;
    max-width: 100%;
  }
}
</style>