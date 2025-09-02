import { isArray } from "lodash";
import Validator from 'validatorjs';

export const isEmpty = (value) => {
    if (value == null || value == 'null') {
        return true;
    }
    if (typeof value == "object") {
        return Object.keys(value).length == 0;
    }
    return (
        (isArray(value) && value.length == 0)
        || ((value == undefined || value == 'undefined' || value == null || value == ''))
    )
}

export const validateRequest = (input, rules, messages = {}) => {
    let validation = new Validator(input, rules, messages);
    if (!validation.passes()) {
        return validation?.errors?.errors || {};
    }
    return null;
};