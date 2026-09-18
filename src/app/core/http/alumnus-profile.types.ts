/**
 * Hand-typed against the real `ums-core` source (`UMS.Modules.Alumni.Application.Alumni.
 * AlumnusDto`, `Domain.Alumni.ProfileVisibility`) -- confirmed directly, not guessed.
 *
 * FLAGGED GAP: `requirement-spec.md` §3.1 calls for "education history" and `AlumniEmployment`
 * as structured, multi-entry data, plus an Admin-reviewed verification workflow gating a profile
 * out of directory search. None of these exist server-side -- `Alumnus` carries only a single
 * flat `CurrentEmployer` string (no history), no education-history entity/endpoint anywhere in
 * the module, and no verification-status field/endpoint anywhere (grepped the whole module for
 * "verif", zero relevant hits). This app's interim treatment (documented on
 * `AlumnusContextService` and the profile-edit feature) uses the one real, confirmed field that
 * plays a structurally similar gating role -- `ProfileVisibility` (`Private` by default on
 * creation, `Public` once the alumnus opts in) -- as the closest honest analog to "not yet
 * eligible for directory search," rather than fabricating an admin-verification endpoint that
 * does not exist. A true Admin-reviewed verification workflow needs a backend addition before it
 * can be built for real.
 */
export type ProfileVisibility = 'Private' | 'Public';

export interface AlumnusDto {
  readonly id: string;
  readonly studentIdRef: string;
  readonly graduationYear: number;
  readonly programId: string;
  readonly departmentId: string;
  readonly profileVisibility: ProfileVisibility;
  readonly currentEmployer: string | null;
  readonly bio: string | null;
  readonly location: string | null;
  readonly contactEmail: string | null;
  readonly contactPhone: string | null;
  readonly hideCurrentEmployer: boolean;
  readonly hideContactDetails: boolean;
  readonly createdAt: string;
  readonly version: number;
}

export interface UpdateOwnProfileRequest {
  readonly currentEmployer: string | null;
  readonly bio: string | null;
  readonly location: string | null;
  readonly contactEmail: string | null;
  readonly contactPhone: string | null;
  readonly hideCurrentEmployer: boolean;
  readonly hideContactDetails: boolean;
  readonly visibility: ProfileVisibility | null;
}

export interface AlumniDirectoryFilterParams {
  readonly graduationYear?: number;
  readonly programId?: string;
  readonly departmentId?: string;
  readonly chapterId?: string;
  readonly employer?: string;
  readonly location?: string;
  readonly skip?: number;
  readonly take?: number;
}

export interface AlumniDirectoryEntryDto {
  readonly id: string;
  readonly graduationYear: number;
  readonly programId: string;
  readonly departmentId: string;
  readonly currentEmployer: string | null;
  readonly location: string | null;
  readonly contactEmail: string | null;
  readonly contactPhone: string | null;
}

export interface AlumniDirectoryPage {
  readonly items: readonly AlumniDirectoryEntryDto[];
  readonly skip: number;
  readonly take: number;
}
