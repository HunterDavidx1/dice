<template>
    <div class="character-container">
        <!-- Left Column: Class Selection -->
        <div class="class-section">
            <div class="form-group">
                <select id="class" v-model="selectedClass" class="form-select" @change="onClassChange">
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
                    <span class="domain-label">1° Domain:</span>
                    <span class="domain-value">{{ formatDomain(selectedClass.domain_1) }}</span>
                </div>
                <div class="domain-pill" v-if="selectedClass.domain_2">
                    <span class="domain-label">2° Domain:</span>
                    <span class="domain-value">{{ formatDomain(selectedClass.domain_2) }}</span>
                </div>
            </div>
        </div>

        <!-- Right Column: Character Details -->
        <div class="character-details">
            <div class="form-row">
                <div class="form-group" style="flex: 2; position: relative;">
                    <input type="text" id="characterName" v-model="character.name" class="form-input" placeholder=" "
                        style="padding-right: 40px;">
                    <label for="characterName" class="form-label">Name</label>
                    <button type="button" class="random-name-button" @click="generateRandomName"
                        title="Generate random name">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                            <path d="M3 3v5h5"></path>
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                            <path d="M16 16h5v5"></path>
                        </svg>
                    </button>
                </div>
                <div class="form-group" style="flex: 1;">
                    <select type="text" id="pronouns" v-model="character.pronouns" class="form-select" placeholder=" ">
                        <option value="" disabled selected>Pronoun</option>
                        <option v-for="prn in pronouns" :key="prn" :value="prn">
                            {{ prn }}
                        </option>
                    </select>
                    <label for="pronouns" class="form-label">Pronouns</label>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group" style="flex: 1;">
                    <select id="heritage" v-model="character.heritage" class="form-select">
                        <option value="" disabled selected>Select heritage</option>
                        <option v-for="heritage in heritages" :key="heritage" :value="heritage">
                            {{ heritage }}
                        </option>
                    </select>
                    <label for="heritage" class="form-label">Heritage</label>
                </div>
                <div class="form-group" style="flex: 1;">
                    <select id="subclass" v-model="character.subclass" class="form-select" :disabled="!selectedClass">
                        <option value="" disabled selected>Select subclass</option>
                        <option v-if="selectedClass" :value="selectedClass.subclass_1">
                            {{ selectedClass.subclass_1 }}
                        </option>
                        <option v-if="selectedClass && selectedClass.subclass_2" :value="selectedClass.subclass_2">
                            {{ selectedClass.subclass_2 }}
                        </option>
                    </select>
                    <label for="subclass" class="form-label">Subclass</label>
                </div>
            </div>
        </div>
        <!-- Level Badge (top-right of the whole header) -->
        <div class="level-badge">
            <div class="level-number">{{ character.level }}</div>
            <div class="level-controls">
                <button type="button" class="lvl-btn" @click="decrementLevel">−</button>
                <button type="button" class="lvl-btn" @click="incrementLevel">+</button>
            </div>
            <div class="level-label">LEVEL</div>
        </div>
    </div>
    <div class="stats-section">
        <div class="stats-cards">
            <div class="def-card">
                <div class="def-header evasion">EVASION</div>
                <div class="def-controls">
                    <button type="button" class="trait-btn" @click="decEvasion">−</button>
                    <input class="def-value" type="number" min="0" max="20" step="1"
                           :value="character.evasion"
                           @input="setEvasion(Number($event.target.value))">
                    <button type="button" class="trait-btn" @click="incEvasion">+</button>
                </div>
                <div class="def-sub">Start at 10</div>
            </div>
            <div class="def-card">
                <div class="def-header armor">ARMOR</div>
                <div class="def-sub"></div>
                <div class="def-controls">
                    <button type="button" class="trait-btn" @click="decArmor">−</button>
                    <input class="def-value" type="number" min="0" max="20" step="1"
                           :value="character.armor"
                           @input="setArmor(Number($event.target.value))">
                    <button type="button" class="trait-btn" @click="incArmor">+</button>
                </div>
            </div>
            <div v-for="key in traitsOrder" :key="key" class="trait-card">
                <div class="trait-header">{{ key.toUpperCase() }}</div>
                <div class="trait-controls">
                    <button type="button" class="trait-btn" @click="decTrait(key)">−</button>
                    <input class="trait-value" type="number" :min="-1" :max="2" :step="1"
                           :value="character.traits[key]"
                           @input="setTrait(key, Number($event.target.value))">
                    <button type="button" class="trait-btn" @click="incTrait(key)">+</button>
                </div>
                <div class="trait-verbs">
                    <div class="verb" v-for="v in traitVerbs[key]" :key="v">{{ v }}</div>
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
import armorData from '../../assets/data/armor.json'

const emit = defineEmits(['class-selected', 'domains-selected', 'character-update'])

// Refs
const classes = ref(classesData)
const selectedClass = ref('')
const heritages = ref(['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Tiefling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc'])

const character = ref({
    name: '',
    pronouns: '',
    heritage: '',
    subclass: '',
    level: 1,
    traits: {
        Agility: -1,
        Strength: 0,
        Finesse: 0,
        Instinct: 2,
        Presence: 1,
        Knowledge: 1
    },
    evasion: 10,
    armor: 0
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
        const s = selectedClass.value.suggested_traits
        if (s && Array.isArray(traitsOrder)) {
            const vals = String(s).split(',').map(v => Number(String(v).trim().replace('+', '')))
            if (vals.length === traitsOrder.length) {
                traitsOrder.forEach((k, i) => {
                    character.value.traits[k] = clampTrait(vals[i])
                })
            }
        }
        if (selectedClass.value.evasion) {
            character.value.evasion = clamp20(Number(selectedClass.value.evasion))
        }
        const armorName = selectedClass.value.suggested_armor
        if (armorName) {
            const a = armorData.find(x => x.name === armorName)
            if (a && a.base_score) {
                character.value.armor = clamp20(Number(a.base_score))
            } else {
                character.value.armor = 0
            }
            const ft = a?.feat_text || ''
            const m = ft.match(/([+-]\d+)\s*to\s*Evasion/i)
            if (m) {
                const adj = Number(m[1])
                if (!Number.isNaN(adj)) {
                    character.value.evasion = clamp20(Number(character.value.evasion) + adj)
                }
            }
        }
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

const incrementLevel = () => {
    const current = Number(character.value.level) || 1
    character.value.level = Math.min(20, current + 1)
     if (character.value.level > 10 ) {
        character.value.level = 10
    }
}

const decrementLevel = () => {
    const current = Number(character.value.level) || 1
    character.value.level = Math.max(1, current - 1)
}

const traitsOrder = ['Agility', 'Strength', 'Finesse', 'Instinct', 'Presence', 'Knowledge']

const clampTrait = (v) => Math.max(-1, Math.min(2, v))
const incTrait = (key) => {
    const current = Number(character.value.traits[key]) || 0
    character.value.traits[key] = clampTrait(current + 1)
}
const decTrait = (key) => {
    const current = Number(character.value.traits[key]) || 0
    character.value.traits[key] = clampTrait(current - 1)
}
const setTrait = (key, v) => {
    character.value.traits[key] = clampTrait(v)
}

const traitVerbs = {
    Agility: ['Sprint', 'Leap', 'Maneuver'],
    Strength: ['Lift', 'Smash', 'Grapple'],
    Finesse: ['Control', 'Hide', 'Tinker'],
    Instinct: ['Perceive', 'Sense', 'Navigate'],
    Presence: ['Charm', 'Perform', 'Deceive'],
    Knowledge: ['Recall', 'Analyze', 'Comprehend']
}

const clamp20 = (v) => Math.max(0, Math.min(20, v))
const incEvasion = () => { character.value.evasion = clamp20(Number(character.value.evasion) + 1) }
const decEvasion = () => { character.value.evasion = clamp20(Number(character.value.evasion) - 1) }
const setEvasion = (v) => { character.value.evasion = clamp20(v) }
const incArmor = () => { character.value.armor = clamp20(Number(character.value.armor) + 1) }
const decArmor = () => { character.value.armor = clamp20(Number(character.value.armor) - 1) }
const setArmor = (v) => { character.value.armor = clamp20(v) }

// Initialize
onMounted(() => {
    selectedClass.value = ''
    generateRandomName()
})

const pronouns = ['He/Him/His', 'She/Her/Hers', 'They/Them/Theirs'];
</script>

<style scoped>
/* Base Styles */
.character-container {
    display: flex;
    gap: 2rem;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    position: relative;
    padding-right: 100px;
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

.form-select,
.form-input {
    width: 100%;
    padding: 24px 16px 12px 16px;
    font-size: 1rem;
    line-height: 1.5;
    color: #333;
    background-color: #fff;
    border: 2px solid #cfd3d7;
    border-radius: 10px;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    box-sizing: border-box;
    height: 52px;
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02);
}

.form-select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    appearance: none;
    padding-top: 20px;
    padding-right: 44px;
    padding-bottom: 12px;
    padding-left: 16px;
    line-height: 1.2;
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
    top: 8px;
    left: 14px;
    color: #3a4a6b;
    background: transparent;
    padding: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.2s ease;
    pointer-events: none;
    transform-origin: left top;
}

.form-select:focus+.form-label,
.form-input:focus+.form-label {
    color: #2d5bd1;
}

/* Domain Styles */
.domains-container {
    margin: 1rem 0;
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    width: 100%;
    align-items: stretch;
    justify-content: space-between;
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
    flex: 1;
    min-width: 0;
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

.level-badge {
    position: absolute;
    top: 8px;
    right: 0;
    width: 80px;
    min-width: 80px;
    height: 80px;
    border: 2px solid #cfd3d7;
    border-radius: 10px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 1px 0 rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02);
}

.level-number {
    font-size: 1.25rem;
    font-weight: 700;
    color: #3a4a6b;
    line-height: 1;
    transform: translateY(0);
}

.level-controls {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    gap: 4px;
}

.lvl-btn {
    border: 1px solid #cfd3d7;
    background: #f8f9fa;
    color: #3a4a6b;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
}

.lvl-btn:hover {
    background: #e9ecef;
}

.level-label {
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #3a4a6b;
    color: #fff;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 10px;
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

.stats-section {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    align-items: start;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
    padding-right: 100px;
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.75rem;
    position: relative;
}

.defense-section { display: contents; }

.def-card {
    border: 2px solid #cfd3d7;
    border-radius: 10px;
    background: #fff;
    padding: 0.4rem 0.5rem 0.6rem 0.5rem;
    min-height: 72px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    box-shadow: inset 0 1px 0 rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02);
}

.def-header {
    background: #3a4a6b;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    text-align: center;
    padding: 3px 6px;
    border-radius: 8px;
    margin-bottom: 0.35rem;
}
.def-header.evasion { background: #2e7d32; }
.def-header.armor { background: #6c757d; }

.def-sub {
    font-size: 0.7rem;
    color: #6c757d;
    text-align: right;
    font-style: italic;
    margin-top: 4px;
    margin-bottom: 0.2rem;
}

.def-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 6px;
}

.def-controls .trait-btn {
    width: 28px;
    height: 28px;
    font-size: 0.85rem;
}

.def-value {
    width: 52px;
    height: 28px;
    border: 2px solid #cfd3d7;
    border-radius: 8px;
    text-align: center;
    font-weight: 700;
    color: #3a4a6b;
    font-size: 0.95rem;
    line-height: 26px;
}

.traits-section {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.75rem;
}

.trait-card {
    border: 2px solid #cfd3d7;
    border-radius: 10px;
    background: #fff;
    padding: 0.5rem 0.5rem 0.75rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    box-shadow: inset 0 1px 0 rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02);
}

.trait-header {
    background: #3a4a6b;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    text-align: center;
    padding: 4px 6px;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}

.trait-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.trait-btn {
    border: 1px solid #cfd3d7;
    background: #f8f9fa;
    color: #3a4a6b;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
}

.trait-btn:hover {
    background: #e9ecef;
}

.trait-value {
    width: 42px;
    height: 30px;
    border: 2px solid #cfd3d7;
    border-radius: 8px;
    text-align: center;
    font-weight: 700;
    color: #3a4a6b;
}

.trait-verbs {
    margin-top: 6px;
    font-size: 0.8rem;
    color: #6c757d;
    text-align: center;
    line-height: 1.1;
}

/* Responsive Design */
@media (max-width: 768px) {
    .character-container {
        flex-direction: column;
        gap: 1rem;
        padding-right: 0;
    }
    .domains-container {
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
    }
    .domain-pill {
        flex: 1;
    }
    .level-badge {
        position: static;
        margin-top: 0.5rem;
        width: 100%;
        height: 60px;
    }
    .class-section,
    .character-details {
        width: 100%;
        max-width: 100%;
    }
    .stats-section {
        grid-template-columns: 1fr;
    }
    .stats-cards::after {
        display: none;
    }
    .stats-divider {
        display: none;
    }
    .traits-section {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
