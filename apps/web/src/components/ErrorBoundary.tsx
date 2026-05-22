import { Component, type ReactNode } from "react";
import { Box, Typography, Button } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
          <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            页面出错了
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {this.state.error?.message || "发生了意外错误"}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
          >
            返回首页
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
