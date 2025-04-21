import RoutineExercise from "@/models/RoutineExercise";

export async function normalizeOrder(routine_id: string) {
  const exercises = await RoutineExercise.find({ routine_id }).sort({
    order: 1,
  });
  for (let i = 0; i < exercises.length; i++) {
    if (exercises[i].order !== i + 1) {
      exercises[i].order = i + 1;
      await exercises[i].save();
    }
  }
}
