export type UserDetails = {
  name: string;
  profilePicture: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  institutionMember?: boolean;
};

type MeResponse = {
  status: string;
  message?: string;
  data: {
    user: {
      id: number;
      firstname: string;
      lastname: string;
      email: string;
      role: string;
      profilepicture: string | null;
      institutionMember: boolean | null;
    } | null;
  };
};

export async function getUserDetails(): Promise<UserDetails | null> {
  const response = await fetch('/api/v1/me', {
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const data: MeResponse = await response.json();

  if (data.status !== 'ok' || !data.data.user) {
    return null;
  }

  return {
    name: data.data.user.firstname,
    profilePicture: data.data.user.profilepicture ?? 'https://i.pravatar.cc/150?img=12',
    firstName: data.data.user.firstname,
    lastName: data.data.user.lastname,
    email: data.data.user.email,
    institutionMember: data.data.user.institutionMember ?? false,
  };
}
