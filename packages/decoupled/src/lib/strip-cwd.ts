import { relative } from "path"

export const stripCwd = (path: string): string => relative('', path)
