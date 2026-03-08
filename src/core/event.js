/**
 * EventManager - A utility class for managing and triggering events.
 *
 * @class
 * @description
 * The `EventManager` class provides a simple interface for registering,
 * unregistering, and triggering custom events within your application.
 * It allows you to organize and handle callbacks efficiently.
 *
 * @constructor
 * @property {Object} registry - An object to store registered event callbacks.
 *
 * @method on(eventName, callback, context)
 * Registers a callback function for a specific event.
 *
 * @method off(eventName, callback, context)
 * Unregisters a callback function for a specific event.
 *
 * @method trigger(eventName, ...args)
 * Triggers an event, executing all registered callback functions.
 *
 * @example
 * // Create an instance of EventManager
 * const eventManager = new EventManager();
 *
 * // Define a sample callback function
 * function sampleCallback(message) {
 *     console.log(`Sample callback executed: ${message}`);
 * }
 *
 * // Register the callback for the 'sampleEvent' with a specific context
 * eventManager.on('sampleEvent', sampleCallback, { contextData: 'example' });
 *
 * // Trigger the 'sampleEvent', executing the registered callback
 * eventManager.trigger('sampleEvent', 'Hello, EventManager!');
 *
 * // Unregister the callback for the 'sampleEvent'
 * eventManager.off('sampleEvent', sampleCallback, { contextData: 'example' });
 */
import log from "./logger"

class EventManager {

    #registry = {}

    /**
     * Register a callback function for a specific event.
     * @param {string} eventName - The name of the event.
     * @param {function} callback - The callback function to be executed when the event occurs.
     * @param {Object} context - The context in which the callback should be executed (optional).
     */

    on(eventName, callback, context) {
        // Create an array for the event if it doesn't exist
        if (!this.#registry[eventName]) {
            this.#registry[eventName] = []
        }

        // Check if the same callback and context combination is already registered
        const existingRegistration = this.#registry[eventName].find(entry => {
            return entry.originalCallback === callback && entry.context === context
        })

        if (!existingRegistration) {
            const wrappedCallback = function (...args) {
                callback.call(context, ...args)
            }

            this.#registry[eventName].push({
                originalCallback: callback,
                context,
                wrappedCallback,
            })

        } else {
            log(`Callback for event '${eventName}' is already registered with the same context.`)
        }
    }

    /**
     * Unregister a callback function for a specific event.
     * @param {string} eventName - The name of the event.
     * @param {function} callback - The original callback function to be removed.
     * @param {Object} context - The context associated with the callback (optional).
     */

    off(eventName, callback, context) {
        const callbackToRemove = this.#registry[eventName]?.find(entry => {
            return entry.originalCallback === callback && entry.context === context
        })
        
        if (callbackToRemove) {
            this.#registry[eventName] = this.#registry[eventName].filter(entry => entry !== callbackToRemove)
        } else {
            log(`Callback for event '${eventName}' with the specified context was not found.`)
        }
    }

    /**
     * Trigger an event, executing all registered callback functions.
     * @param {string} eventName - The name of the event to trigger.
     * @param {...any} args - Additional arguments to be passed to the callback functions.
     */

    trigger(eventName, ...args) {
        if (this.#registry[eventName]) {
            this.#registry[eventName].forEach(entry => entry.wrappedCallback(...args))
        }
    }
}

const eventManager = new EventManager()

export default eventManager