const validate = (validator) => (req, res, next) => {
    if (typeof validator !== 'function') {
        return next();
    }

    return validator(req, res, next);
};

module.exports = validate;
