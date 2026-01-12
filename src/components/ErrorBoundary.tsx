import React, { Component, ReactNode } from "react";
import { Text, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";

type Props = {
	children: ReactNode;
	fallback?: ReactNode;
};

type State = {
	hasError: boolean;
	error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<View className="items-center justify-center flex-1 px-6 bg-zinc-950">
					<Text className="mb-4 text-2xl font-bold text-center text-white">
						Something went wrong
					</Text>
					<Text className="mb-6 text-center text-zinc-400">
						{this.state.error?.message || "An unexpected error occurred"}
					</Text>
					<PrimaryButton
						title="Reload App"
						onPress={() => this.setState({ hasError: false, error: null })}
					/>
				</View>
			);
		}

		return this.props.children;
	}
}
