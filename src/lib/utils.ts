import { clsx, type ClassValue } from "clsx"
import { twMerge } from "./tailwindMerge"; // Updated import path

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
