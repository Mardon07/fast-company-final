import React, { useEffect, useState } from "react";
import { validator } from "../../utils/validator";
import TextField from "../common/form/textField";
import CheckBoxField from "../common/form/checkBoxField";
import axios from "axios";
import { setTokens } from "../../services/localStorage.service";
import { useHistory } from "react-router-dom";

const httpLogin = axios.create({});
const LoginForm = () => {
    const history = useHistory();
    const [item, setItem] = useState({
        email: "",
        password: "",
        stayOn: false
    });
    const [errors, setErrors] = useState({});
    const handleChange = (target) => {
        setItem((prevState) => ({
            ...prevState,
            [target.name]: target.value
        }));
    };
    const validatorConfig = {
        email: {
            isRequired: {
                message: "Электронная почта обязательна для заполнения"
            },
            isEmail: {
                message: "Email введен некорректно"
            }
        },
        password: {
            isRequired: {
                message: "Пароль обязателен для заполнения"
            },
            isCapitalSymbol: {
                message: "Пароль должен содержать хотя бы одну заглавную букву"
            },
            isContainDigit: {
                message: "Пароль должен содержать хотя бы одно число"
            },
            min: {
                message: "Пароль должен состоять минимум из 8 символов",
                value: 8
            }
        }
    };
    useEffect(() => {
        validate();
    }, [item]);
    const validate = () => {
        const errors = validator(item, validatorConfig);
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const isValid = Object.keys(errors).length === 0;

    const handleSubmit = async (e) => {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.REACT_APP_FIREBASE_KEY}`;
        e.preventDefault();
        try {
            const { data } = await httpLogin.post(url, {
                email: item.email,
                password: item.password,
                returnSecureToken: true
            });

            setTokens(data);
            history.push("/");
        } catch (error) {
            const { code, message } = error.response.data.error;
            if (code === 400) {
                if (message === "INVALID_PASSWORD") {
                    const errorPassword = {
                        password: "Пароль не верный"
                    };
                    setErrors(errorPassword);
                }
            }
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <TextField
                label="Электронная почта"
                name="email"
                value={item.email}
                onChange={handleChange}
                error={errors.email}
            />
            <TextField
                label="Пароль"
                type="password"
                name="password"
                value={item.password}
                onChange={handleChange}
                error={errors.password}
            />
            <CheckBoxField
                value={item.stayOn}
                onChange={handleChange}
                name="stayOn"
            >
                Оставаться в системе
            </CheckBoxField>
            <button
                className="btn btn-primary w-100 mx-auto"
                type="submit"
                disabled={!isValid}
            >
                Submit
            </button>
        </form>
    );
};

export default LoginForm;
