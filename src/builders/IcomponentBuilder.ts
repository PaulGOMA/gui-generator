import type { ComponentData } from "../core/types"

/**
 * Defines the contract for all component builders used by the GUI generator.
 *
 * A ComponentBuilder is responsible for:
 *  - validating whether a JSON entry matches the structure required
 *    to build a specific component type
 *  - transforming a valid JSON entry into a strongly‑typed ComponentData object
 *
 * Implementations of this interface encapsulate the logic required to
 * interpret raw JSON configuration and convert it into the internal
 * representation used by the rendering engine.
 */
export interface IComponentBuilder {

    /**
     * Determines whether the provided JSON entry contains the fields
     * and structure required to build this component type.
     *
     * @param jsonEntry - A raw JSON object representing a component definition.
     * @returns `true` if the entry is valid for this builder, otherwise `false`.
     */
    validate(jsonEntry: Record<string, unknown>): boolean

    /**
     * Builds a fully‑typed ComponentData object from a validated JSON entry.
     *
     * This method assumes that `validate()` has already been called and
     * returned `true`. Implementations may throw an error if required
     * fields are missing or malformed.
     *
     * @param jsonEntry - A validated JSON object describing the component.
     * @returns A ComponentData instance ready for use by the engine.
     */
    build(jsonEntry: Record<string, unknown>): ComponentData
}
