import React, {ChangeEvent, useEffect, useState} from "react";
import { useAppSelector } from "../../app/hooks";
import { selectAuth, LoginStatus } from "../Login/authslice";
import axios from 'axios';

export interface AuthProps {
  apiToken: string;
  getNote: any;
  createNote: any
}

export interface Error {
  title: string;
  info: string;
}

export function Note() {
  const auth = useAppSelector(selectAuth);
  const [error, setError] = useState<Error>({title: '', info: ''});

  if (auth.status !== LoginStatus.LOGGED_IN) return null;
  const {
    apiToken,
    user: { id: userId },
  } = auth;

  const api = axios.create({
    baseURL: 'https://60b793ec17d1dc0017b8a6bc.mockapi.io/',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
  });

  const getNote = async () => {
    try {
      const {data} = await api.get(`/users/${userId}/`);
      setError({title: '', info: ''});
      return data.note;
    } catch (e) {
      setError({title: 'Something went wrong...', info: e.message});
    }
  }

  const createNote = async (note: string) => {
    try {
      await api.put(`/users/${userId}/`, {note});
      setError({title: '', info: ''});
    } catch (e) {
      setError({title: 'Something went wrong...', info: e.message});
    }
  }

  return (
    <div>
      <NoteField apiToken={apiToken} getNote={getNote} createNote={createNote} />
      {
         error.title &&
          (<span className={'error-message'}>
            <p>{error.title}</p>
            <p>{error.info}</p>
          </span>)
      }
    </div>
  );
}

function NoteField({ apiToken, getNote, createNote }: AuthProps) {
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    getNote().then((response: string) => setNote(response));
  }, [apiToken]);

  const onChangeNote = async (event: ChangeEvent<HTMLTextAreaElement>) => {
    const {target: {value}} = event;

    setNote(value);
    await createNote(value);
  }

  return(
      <textarea
        placeholder="Note goes here..."
        value={note}
        onChange={onChangeNote}
  />
  );
}
