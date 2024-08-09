"use client";
import Image from "next/image";
import { useState } from "react";
import {
  Box,
  Container,
  Stack,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi I'm the Headstarter Support Agent, how can I assist you today?`,
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    })
      .then(function (response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let result = "";
        return reader.read().then(function processText({ done, value }) {
          if (done) {
            return result;
          }
          const text = decoder.decode(value || new Int8Array(), {
            stream: true,
          });
          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1];
            let otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              {
                ...lastMessage,
                content: lastMessage.content + text,
              },
            ];
          });
          return reader.read().then(processText);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="black"
    >
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "white",
          padding: "0 !important",
        }}
      >
        <Stack overflow="auto" flex={1}>
          {messages.map((msg, i) => {
            return (
              <Box
                key={i}
                display="flex"
                justifyContent={
                  msg.role === "assistant" ? "flex-end" : "flex-start"
                }
                p={msg.role === "assistant" ? "0 24px 0 0" : "0 0 0 24px"}
              >
                <Box
                  bgcolor={
                    msg.role === "assistant" ? "#607d8b" : "primary.main"
                  }
                  color="white"
                  borderRadius={8}
                  p={3}
                  mt={2}
                >
                  {msg.content}
                </Box>
              </Box>
            );
          })}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          py={2}
          px="24px"
          bgcolor="transparent"
        >
          <TextField
            value={message}
            placeholder="Message"
            fullWidth
            onChange={(e) => setMessage(e.target.value)}
          />
          <IconButton
            color="primary"
            aria-label="send message"
            onClick={sendMessage}
            size="large"
          >
            <SendIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
}
