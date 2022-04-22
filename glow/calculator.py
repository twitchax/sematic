import inspect
import types
import typing

from glow.abstract_calculator import AbstractCalculator
from glow.future import Future
from glow.types.type import is_type, Type
from glow.types.types.null import Null
from glow.utils.memoized_property import memoized_property


class Calculator(AbstractCalculator):
    """
    A Calculator is glow's base unit of computation in a graph.

    Functions decorated with the `@calculator` decorator become
    instances of `Calculator`.
    """

    def __init__(self, func: types.FunctionType) -> None:
        if not inspect.isfunction(func):
            raise ValueError("{} is not a function".format(func))

        self._func = func

        self.__doc__ = func.__doc__
        self.__module__ = func.__module__
        self.__name__ = func.__name__

        self._validate_arg_specs()
        self._set_types()

    def __repr__(self):
        return "{}.{}".format(self.__module__, self.__name__)

    def _validate_arg_specs(self):
        """
        Validates the calculator's function argument specification.

        Current validations:
        - The function has no variadic arguments (*args, **kwargs)
        """
        arg_specs = self._full_arg_spec
        for arg in (arg_specs.varargs, arg_specs.varkw):
            if arg is not None:
                raise ValueError(
                    (
                        "Variadic arguments are not supported."
                        " {} has variadic argument {}."
                        " See https://docs."
                    ).format(self, repr(arg))
                )

    def _set_types(self) -> None:
        """
        Sets input and output types.
        """
        annotations = self._func.__annotations__

        output_type: typing.Type[Type] = Null
        input_types: typing.Dict[str, typing.Type[Type]] = {}

        for name, type_ in annotations.items():
            if not is_type(type_):
                raise ValueError(
                    "{} is not a valid type annotation for {}. See https://docs.".format(
                        type_.__name__, name
                    )
                )
            if name == "return":
                output_type = type_
            else:
                input_types[name] = type_

        missing_annotations = set(self._full_arg_spec.args) - set(input_types)
        if len(missing_annotations) > 0:
            raise ValueError(
                (
                    "Missing calculator type annotations."
                    " The following arguments are not annotated: {}"
                ).format(_repr_str_iterable(missing_annotations))
            )

        self._output_type: typing.Type[Type] = output_type
        self._input_types: typing.Dict[str, typing.Type[Type]] = input_types

    @memoized_property
    def _full_arg_spec(self):
        return inspect.getfullargspec(self._func)

    @property
    def func(self) -> types.FunctionType:
        return self._func

    @property
    def output_type(self) -> typing.Type[Type]:
        return self._output_type

    @property
    def input_types(self) -> typing.Dict[str, typing.Type[Type]]:
        return self._input_types

    # Returns typing.Any instead of Future to ensure
    # calculator algebra is valid from a mypy perspective
    def __call__(self, *args: typing.Any, **kwargs: typing.Any) -> typing.Any:
        argument_binding = self.__signature__().bind(*args, **kwargs)
        argument_map = argument_binding.arguments

        if set(argument_map) != set(self._input_types):
            raise ValueError(
                "Passed arguments {} do not match calculator signature: {}".format(
                    _repr_str_iterable(set(argument_map)),
                    _repr_str_iterable(set(self._input_types)),
                )
            )

        cast_arguments = self.cast_inputs(argument_map)

        return Future(self, cast_arguments)

    def __signature__(self) -> inspect.Signature:
        return inspect.signature(self._func)

    def calculate(self, **kwargs) -> typing.Any:
        return self.func(**kwargs)

    def cast_inputs(
        self, kwargs: typing.Dict[str, typing.Any]
    ) -> typing.Dict[str, typing.Any]:
        """
        Attempts to cast passed inputs to actual input values based on the
        calculator's input type signature.

        Parameters
        ----------
        kwargs: typing.Dict[str, typing.Any]
            Passed input values

        Returns
        -------
        typing.Dict[str, typing.Any]
            cast inputs
        """
        return {
            name: self.cast_value(
                kwargs[name],
                type_,
                error_prefix=(
                    "Invalid input type for argument {} when calling calculator '{}'."
                ).format(repr(name), self),
            )
            for name, type_ in self.input_types.items()
        }

    def cast_output(self, value: typing.Any) -> typing.Any:
        """
        Attempts to cast the value returned by the calculator logic to an actual
        output value based on the calculator's output type signature.

        Parameters
        ----------
        value: typing.Any
            The output value of the calculator logic

        Returns
        -------
        typing.Any
            The cast output value
        """
        return self.cast_value(
            value, self.output_type, error_prefix="Invalid output type."
        )

    @staticmethod
    def cast_value(
        value: typing.Any, type_: typing.Type[Type], error_prefix: str = ""
    ) -> typing.Any:
        """
        Attempts to cast a value to the passed type.
        """
        if isinstance(value, Future):
            can_cast, error = type_.can_cast_type(value.calculator.output_type)
            if not can_cast:
                raise TypeError(
                    "{} Cannot cast {} to {}: {}".format(
                        error_prefix, value.calculator.output_type, type_, error
                    )
                )
            return value

        if is_type(type(value)) and type_.can_cast_type(type(value))[0]:
            return value

        cast_value, error = type_.safe_cast(value)
        if error is not None:
            raise TypeError(
                "{} Cannot cast {} to {}: {}".format(error_prefix, value, type_, error)
            )

        return cast_value


def _repr_str_iterable(str_iterable: typing.Iterable[str]) -> str:
    return ", ".join(repr(arg) for arg in sorted(str_iterable))


def calculator(
    func: typing.Callable = None,
) -> typing.Union[typing.Callable, Calculator]:
    """
    calculator decorator.
    """

    def _wrapper(func_):
        return Calculator(func_)

    if func is None:
        return _wrapper

    return _wrapper(func)
